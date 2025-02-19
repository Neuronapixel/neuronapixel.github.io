<template>
  <div class="home">
    <img src="../assets/launchLogo.png" width="180" height="180" />
    <welcome />
  </div>
</template>

<script>
import Welcome from "@/components/Welcome.vue";

export default {
  name: "Home",
  components: {
    Welcome
  },
  mounted() {
    console.log("Home component mounted");
  }
};
</script>