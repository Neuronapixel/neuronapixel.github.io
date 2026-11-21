#!/usr/bin/env python3
"""Rebuild the Apple AR asset from the logo component using macOS USD tools.

Run from any directory: python3 scripts/generate-logo-usdz.py
Requires usdzip and usdchecker (included in current macOS).
"""
from pathlib import Path
import argparse
import math
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--thumbnail', action='store_true', help='Also render the PNG thumbnail using Metal')
options = parser.parse_args()
component = (ROOT / 'src/components/logo-mark.vue').read_text()
cubes = re.findall(
    r'<a-box\s+class="logo-cube"\s+position="([0-2] [0-2] [0-2])"\s+:material="(primary|secondary)Material"',
    component,
)
if len(cubes) != 27 or len({position for position, _ in cubes}) != 27:
    raise ValueError('Expected the complete 27-cube logo in logo-mark.vue')

source = ROOT / 'src/assets/models/neuronapixel-logo.usda'
package = ROOT / 'public/models/neuronapixel-logo.usdz'


def linear(value):
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def material(name, color, metalness, emissive):
    rgb = ', '.join(f'{linear(channel / 255):.8f}' for channel in color)
    return f'''
        def Material "{name}"
        {{
            token outputs:surface.connect = </Neuronapixel/Materials/{name}/Surface.outputs:surface>
            def Shader "Surface"
            {{
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor = ({rgb})
                color3f inputs:emissiveColor = ({emissive}, {emissive}, {emissive})
                float inputs:metallic = {metalness}
                float inputs:roughness = 0.4
                float inputs:opacity = 1
                token outputs:surface
            }}
        }}
'''


header = '''#usda 1.0
(
    defaultPrim = "Neuronapixel"
    metersPerUnit = 1
    upAxis = "Y"
    startTimeCode = 0
    endTimeCode = 360
    timeCodesPerSecond = 30
    framesPerSecond = 30
    documentation = "Neuronapixel: 27 red and white cubes, 15 cm wide, with a 12-second floating loop. Generated from logo-mark.vue."
)

def Xform "Neuronapixel" (
    kind = "component"
)
{
    double3 xformOp:translate = (0, 0.075, 0)
    double3 xformOp:scale = (0.5, 0.5, 0.5)
    uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:scale"]
    def Scope "Materials"
    {
'''
# Read material colours from the same component as the website.
colors = dict(re.findall(r'(primary|secondary)Material\s*=\s*\n?\s*\'color: #(\w{6});', component))
if len(colors) != 2:
    raise ValueError('Expected the two logo material colours')
materials = ''.join(material(name.title(), tuple(bytes.fromhex(colors[name])),
                             0.05 if name == 'primary' else 0,
                             0 if name == 'primary' else 0.4)
                    for name in ('primary', 'secondary'))
# Match the web preview's easeInOutSine: six seconds up, six seconds down.
# The root's 0.5 scale turns 4 cm of local travel into 2 cm in the real world.
# Starting at the lower endpoint keeps the base at or above the placement surface.
float_samples = ''.join(
    f'            {frame}: (0, {0.02 * (1 - math.cos(math.tau * frame / 360)):.8f}, 0),\n'
    for frame in range(361)
)
logo_transform = '''    }
    def Xform "Logo"
    {
        double3 xformOp:translate = (0, 0, 0)
        double3 xformOp:translate.timeSamples = {
''' + float_samples + '''        }
        float xformOp:rotateY = -22
        uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:rotateY"]
'''
meshes = []
for position, color in cubes:
    x, y, z = [int(axis) for axis in position.split()]
    translation = ', '.join(f'{(axis - 1) * 0.1:.2f}' for axis in (x, y, z))
    meshes.append(f'''
        def Mesh "Cube_{x}_{y}_{z}" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {{
            double3 xformOp:translate = ({translation})
            uniform token[] xformOpOrder = ["xformOp:translate"]
            uniform token subdivisionScheme = "none"
            int[] faceVertexCounts = [4, 4, 4, 4, 4, 4]
            int[] faceVertexIndices = [0, 3, 2, 1, 4, 5, 6, 7, 0, 1, 5, 4, 3, 7, 6, 2, 0, 4, 7, 3, 1, 2, 6, 5]
            point3f[] points = [(-0.05, -0.05, -0.05), (0.05, -0.05, -0.05), (0.05, 0.05, -0.05), (-0.05, 0.05, -0.05), (-0.05, -0.05, 0.05), (0.05, -0.05, 0.05), (0.05, 0.05, 0.05), (-0.05, 0.05, 0.05)]
            normal3f[] normals = [(0, 0, -1), (0, 0, 1), (0, -1, 0), (0, 1, 0), (-1, 0, 0), (1, 0, 0)] (
                interpolation = "uniform"
            )
            float3[] extent = [(-0.05, -0.05, -0.05), (0.05, 0.05, 0.05)]
            rel material:binding = </Neuronapixel/Materials/{color.title()}>
        }}
''')
source.parent.mkdir(parents=True, exist_ok=True)
package.parent.mkdir(parents=True, exist_ok=True)
source.write_text(header + materials + logo_transform + ''.join(meshes) + '    }\n}\n')
with tempfile.TemporaryDirectory(prefix='neuronapixel-usdz-') as temporary:
    staged_package = Path(temporary) / package.name
    subprocess.run(['usdzip', '--arkitAsset', str(source), str(staged_package)], check=True)
    subprocess.run(['usdchecker', '--arkit', '--strict', str(staged_package)], check=True)
    package.write_bytes(staged_package.read_bytes())
    package.chmod(0o644)
    if options.thumbnail:
        camera = Path(temporary) / 'camera.usda'
        camera.write_text('''#usda 1.0
def Camera "PreviewCamera"
{
    float focalLength = 45
    float horizontalAperture = 20.955
    float verticalAperture = 20.955
    double3 xformOp:translate = (0, 0.48, 1.2)
    float3 xformOp:rotateXYZ = (-15, 0, 0)
    uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:rotateXYZ"]
}
''')
        thumbnail = package.with_suffix('.png')
        subprocess.run(['usdrecord', '--sessionLayer', str(camera), '--camera', '/PreviewCamera',
                        '--imageWidth', '512', str(staged_package), str(thumbnail)], check=True)
print(f'Created {package.relative_to(ROOT)} ({package.stat().st_size:,} bytes)')
