import { createApp } from 'vue';
import App from './App.vue';
import { createAppI18n, readSavedLocale } from './i18n';
import router from './router';
import { injectTagManager } from './utils/injectTagManager';

injectTagManager(import.meta.env.VITE_GTM_ID);
createApp(App).use(router).use(createAppI18n(readSavedLocale())).mount('#app');
