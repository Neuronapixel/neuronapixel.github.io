import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import About from "@/views/About.vue";
import VRama from "@/views/VRama.vue";
import MemoriaVirtual from "@/views/MemoriaVirtual.vue";
import NeuronaTornasol from "@/views/NeuronaTornasol.vue";
import { defineComponent } from "vue";


const routes:Array<RouteRecordRaw>= [
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
  history: createWebHashHistory(),
  routes
});

export default router;
