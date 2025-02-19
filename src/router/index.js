import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  }
  // ...other routes...
];

const router = createRouter({
  base: import.meta.env.BASE_URL,
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
