<template>
  <div class="home">
    <img
      src="@/assets/launchLogo.png"
      width="180"
      height="180"
    >
    <WelcomePanel />
  </div>
</template>

<script setup>
import WelcomePanel from '@/components/welcome-panel.vue';

defineOptions({
  name: 'HomeView',
});
</script>

<style scoped>
.home {
  /* Your styles here */
}
</style>
