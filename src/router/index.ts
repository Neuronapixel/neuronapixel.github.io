import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/vr-ama",
    name: "VRama",
    component: () =>
      import(/* webpackChunkName: "vrama" */ "../views/VRama.vue")
  },
  {
    path: "/memoria-virtual",
    name: "Memoria Virtual",
    component: () =>
      import(
        /* webpackChunkName: "memoriavirtual" */ "../views/MemoriaVirtual.vue"
      )
  },
  {
    path: "/neurona-tornasol",
    name: "Neurona Tornasol",
    component: () =>
      import(
        /* webpackChunkName: "neuronatornasol" */ "../views/NeuronaTornasol.vue"
      )
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
