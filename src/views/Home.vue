<template>
  <div class="home">
    <img src="@/assets/launchLogo.png" width="180" height="180" />
    <Welcome />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Welcome from "@/components/Welcome.vue";
</script>

<style scoped>
.home {
  /* Your styles here */
}
</style>