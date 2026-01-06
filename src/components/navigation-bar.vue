<template>
  <div id="nav">
    <router-link to="/"> Home </router-link>
    <router-link to="/about"> About </router-link>
    <router-link to="/vr-ama"> VR-ama </router-link>
    <router-link to="/memoria-virtual"> Memoria virtual </router-link>
    <router-link to="/neurona-tornasol"> Neurona Tornasol </router-link>
  </div>
</template>

<script setup>
defineOptions({
  name: 'NavigationBar',
});
</script>

<style>
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
