import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { injectTagManager } from './utils/injectTagManager';

injectTagManager(import.meta.env.VITE_GTM_ID);
createApp(App).use(router).mount('#app');
