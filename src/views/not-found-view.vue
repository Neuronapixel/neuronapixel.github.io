<template>
  <main class="not-found">
    <p class="eyebrow">404</p>
    <h1>Page not found</h1>
    <p>
      The requested route does not exist or has moved. Use the main experience
      entry point to continue.
    </p>
    <router-link to="/">Return home</router-link>
  </main>
</template>

<script setup lang="ts">
defineOptions({
  name: 'NotFoundView',
});
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
  color: #1f2233;
}

.eyebrow {
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ff2f2f;
}
</style>
