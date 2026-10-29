import { flushPromises } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import {
  createRoomArSession,
  type ArCapabilities,
  type ArStatus,
} from './roomArSession';
import type {
  ArSession,
  SceneBehavior,
  SceneEntity,
  SkyScene,
  ViewerPose,
} from './skyScene';

const fixture = (
  capabilities: ArCapabilities = {
    secure: true,
    xr: { isSessionSupported: () => Promise.resolve(true) },
  },
) => {
  const scene = document.createElement('a-scene') as SkyScene;
  const logo = document.createElement('a-entity') as SceneEntity;
  const session = Object.assign(new EventTarget(), {
    end: vi.fn(() => {
      session.dispatchEvent(new Event('end'));
      return Promise.resolve();
    }),
    domOverlayState: { type: 'screen' },
  }) satisfies ArSession;
  const reference = new EventTarget();
  let pose: ViewerPose | null = null;
  const behaviors: SceneBehavior[] = [];
  scene.addBehavior = vi.fn((behavior: SceneBehavior) => {
    behaviors.push(behavior);
  });
  scene.removeBehavior = vi.fn();
  scene.renderer = { xr: { getReferenceSpace: () => reference } };
  scene.frame = {
    getViewerPose: vi.fn((space: EventTarget) => {
      expect(space).toBe(reference);
      return pose;
    }),
  };
  scene.enterAR = vi.fn(() => {
    scene.xrSession = session;
    scene.dispatchEvent(new Event('enter-vr'));
    return Promise.resolve();
  });
  const changes: ArStatus[] = [];
  const controller = createRoomArSession(scene, logo, capabilities, (status) =>
    changes.push(status),
  );
  return {
    scene,
    logo,
    session,
    reference,
    controller,
    changes,
    setPose: (next: ViewerPose | null) => {
      pose = next;
    },
    tick: () => behaviors.forEach((behavior) => behavior.tick()),
    load: () => scene.dispatchEvent(new Event('loaded')),
    status: () => changes.at(-1)!,
  };
};
const tracked = (x = 0): ViewerPose => ({
  transform: {
    position: { x, y: 1.6, z: 0 },
    orientation: { x: 0, y: 0, z: 0, w: 1 },
  },
});
const settle = flushPromises;

describe('room AR lifecycle', () => {
  it.each([
    { secure: false },
    { secure: true },
    { secure: true, xr: { isSessionSupported: () => Promise.resolve(false) } },
    {
      secure: true,
      xr: { isSessionSupported: () => Promise.reject(new Error('probe')) },
    },
  ])(
    'provides an ordinary preview when unsupported: %j',
    async (capabilities) => {
      const f = fixture(capabilities);
      await settle();
      expect(f.status().state).toBe('unsupported');
      expect(['unsupported', 'insecure', 'checkFailed']).toContain(
        f.status().messageKey,
      );
      f.controller.enter();
      expect(f.scene.enterAR).not.toHaveBeenCalled();
      f.controller.dispose();
    },
  );
  it('requires readiness and a click, places once, and preserves position through tracking loss', async () => {
    const f = fixture();
    await settle();
    expect(f.status().state).toBe('checking');
    f.controller.enter();
    expect(f.scene.enterAR).not.toHaveBeenCalled();
    f.load();
    f.load();
    expect(f.scene.addBehavior).toHaveBeenCalledOnce();
    expect(f.status().state).toBe('ready');
    f.controller.enter();
    f.controller.enter();
    expect(f.scene.enterAR).toHaveBeenCalledOnce();
    expect(f.logo.getAttribute('visible')).toBe('false');
    f.tick();
    expect(f.logo.hasAttribute('position')).toBe(false);
    const vertical = tracked();
    vertical.transform.orientation = {
      x: Math.SQRT1_2,
      y: 0,
      z: 0,
      w: Math.SQRT1_2,
    };
    f.setPose(vertical);
    f.tick();
    expect(f.status().messageKey).toBe('lookAhead');
    f.setPose(tracked(2));
    f.tick();
    expect(f.status().state).toBe('placed');
    expect(f.status().overlay).toBe(true);
    expect(f.logo.getAttribute('position')).toBe('2 1.6 -1.5');
    f.setPose(null);
    f.tick();
    f.setPose(tracked(8));
    f.tick();
    expect(f.logo.getAttribute('position')).toBe('2 1.6 -1.5');
    await settle();
    f.controller.exit();
    expect(f.status().state).toBe('ready');
    expect(f.logo.getAttribute('position')).toBe('0 0 -1.5');
    f.controller.enter();
    f.tick();
    expect(f.logo.getAttribute('position')).toBe('8 1.6 -1.5');
    f.controller.dispose();
    expect(f.scene.removeBehavior).toHaveBeenCalledOnce();
    expect(f.session.end).toHaveBeenCalledTimes(2);
  });
  it('ends on reference-space reset and requests a fresh session', async () => {
    const f = fixture();
    f.load();
    await settle();
    f.controller.enter();
    f.setPose(tracked());
    f.tick();
    f.reference.dispatchEvent(new Event('reset'));
    expect(f.session.end).toHaveBeenCalledOnce();
    expect(f.status().state).toBe('error');
    expect(f.status().messageKey).toBe('reset');
    f.controller.dispose();
  });
  it('restores preview after denial and permits a successful retry', async () => {
    const f = fixture();
    f.load();
    await settle();
    vi.mocked(f.scene.enterAR).mockRejectedValueOnce(new Error('denied'));
    f.controller.enter();
    await settle();
    expect(f.status().state).toBe('error');
    expect(f.logo.getAttribute('visible')).toBe('true');
    f.controller.enter();
    expect(f.status().state).toBe('tracking');
    f.controller.dispose();
  });
  it('ignores late support checks and removes listeners before a delayed load', async () => {
    let resolve!: (supported: boolean) => void;
    const f = fixture({
      secure: true,
      xr: {
        isSessionSupported: () =>
          new Promise((done) => {
            resolve = done;
          }),
      },
    });
    await settle();
    f.controller.dispose();
    const count = f.changes.length;
    resolve(true);
    await settle();
    f.load();
    f.scene.dispatchEvent(new Event('enter-vr'));
    expect(f.changes).toHaveLength(count);
    expect(f.scene.addBehavior).not.toHaveBeenCalled();
  });
  it('ends a session that resolves after route unmount', async () => {
    const f = fixture();
    f.load();
    await settle();
    let resolve!: () => void;
    vi.mocked(f.scene.enterAR).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    f.controller.enter();
    f.controller.dispose();
    const count = f.changes.length;
    f.scene.xrSession = f.session;
    resolve();
    await settle();
    expect(f.session.end).toHaveBeenCalledOnce();
    expect(f.changes).toHaveLength(count);
  });
});
