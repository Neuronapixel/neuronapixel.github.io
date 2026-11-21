<template>
  <a-entity>
    <a-entity position="-1 -1 -1">
      <a-box class="logo-cube" position="0 0 0" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 0 0" :material="secondaryMaterial" />
      <a-box class="logo-cube" position="2 0 0" :material="primaryMaterial" />

      <a-box class="logo-cube" position="0 1 0" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 1 0" :material="secondaryMaterial" />
      <a-box class="logo-cube" position="2 1 0" :material="primaryMaterial" />

      <a-box class="logo-cube" position="0 2 0" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 2 0" :material="primaryMaterial" />
      <a-box class="logo-cube" position="2 2 0" :material="secondaryMaterial" />

      <a-box class="logo-cube" position="0 0 1" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 0 1" :material="secondaryMaterial" />
      <a-box class="logo-cube" position="2 0 1" :material="primaryMaterial" />

      <a-box class="logo-cube" position="0 1 1" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 1 1" :material="secondaryMaterial" />
      <a-box class="logo-cube" position="2 1 1" :material="primaryMaterial" />

      <a-box class="logo-cube" position="0 2 1" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 2 1" :material="primaryMaterial" />
      <a-box class="logo-cube" position="2 2 1" :material="secondaryMaterial" />

      <a-box class="logo-cube" position="0 0 2" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 0 2" :material="secondaryMaterial" />
      <a-box class="logo-cube" position="2 0 2" :material="primaryMaterial" />

      <a-box class="logo-cube" position="0 1 2" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 1 2" :material="secondaryMaterial" />
      <a-box class="logo-cube" position="2 1 2" :material="primaryMaterial" />

      <a-box class="logo-cube" position="0 2 2" :material="primaryMaterial" />
      <a-box class="logo-cube" position="1 2 2" :material="primaryMaterial" />
      <a-box class="logo-cube" position="2 2 2" :material="secondaryMaterial" />
    </a-entity>
  </a-entity>
</template>

<script setup lang="ts">
const primaryMaterial = 'color: #ff2f2f; metalness: 0.05; roughness: 0.4';
const secondaryMaterial =
  'color: #ffffff; roughness: 0.4; emissive: #ffffff; emissiveIntensity: 0.4';
</script>
