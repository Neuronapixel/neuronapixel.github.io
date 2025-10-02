import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { setupAnalytics } from "./plugins/analytics";

setupAnalytics();

createApp(App).use(router).mount("#app");
