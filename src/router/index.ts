import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import LegacyHome from "@/views/Home.vue";
import About from "@/views/About.vue";
import VRama from "@/views/VRama.vue";
import MemoriaVirtual from "@/views/MemoriaVirtual.vue";
import NeuronaTornasol from "@/views/NeuronaTornasol.vue";
import XRVersionTwo from "@/views/XRVersionTwo.vue";


const routes:Array<RouteRecordRaw>= [
  {
    path: "/",
    name: "XRHome",
    component: XRVersionTwo
  },
  {
    path: "/classic",
    name: "Home",
    component: LegacyHome
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
