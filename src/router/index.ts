import VueRouter, { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import About from "@/views/About.vue";
import VRama from "@/views/VRama.vue";
import MemoriaVirtual from "../views/MemoriaVirtual.vue";
import NeuronaTornasol from "../views/NeuronaTornasol.vue";


const routes= [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    component:About
  },
  {
    path: "/vr-ama",
    name: "VRama",
    component: VRama
  },
  {
    path: "/memoria-virtual",
    name: "Memoria Virtual",
    component: MemoriaVirtual
  },
  {
    path: "/neurona-tornasol",
    name: "Neurona Tornasol",
    component: NeuronaTornasol
  }
];

const router = createRouter({
  base: import.meta.env.BASE_URL,
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
