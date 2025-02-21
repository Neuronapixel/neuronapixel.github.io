import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: 'docs'
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
