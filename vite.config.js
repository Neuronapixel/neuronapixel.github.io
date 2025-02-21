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
    environment: 'jsdom',
    coverage: {
      provider: "v8", 
      reporter: ['html'],
      exclude: ['vite.config.js','node_modules/', 'tests/','docs/','public/'] 
    }
  }
});
