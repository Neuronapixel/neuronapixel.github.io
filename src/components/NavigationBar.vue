<template>
  <div id="nav">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-link to="/vr-ama">VR-ama</router-link>
    <router-link to="/memoria-virtual">Memoria virtual</router-link>
    <router-link to="/neurona-tornasol">Neurona Tornasol</router-link>
  </div>
</template>

<script>
export default {
  name: "Navigation"
};
</script>

<style lang="scss">
#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
