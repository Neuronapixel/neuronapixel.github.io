<template>
  <div class="home">
    <img src="../assets/launchLogo.png" width="180" height="180" />
    <Welcome />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Welcome from "@/components/Welcome.vue";

onMounted(() => {
  console.log("Home component mounted");
});
</script>

<style scoped>
.home {
  /* Your styles here */
}
</style>