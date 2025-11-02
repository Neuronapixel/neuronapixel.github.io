import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath, URL } from "url";

const sslKeyPath = process.env.VITE_DEV_SSL_KEY;
const sslCertPath = process.env.VITE_DEV_SSL_CERT;

const httpsOptions =
  sslKeyPath &&
  sslCertPath &&
  existsSync(sslKeyPath) &&
  existsSync(sslCertPath)
    ? {
        key: readFileSync(sslKeyPath),
        cert: readFileSync(sslCertPath),
      }
    : undefined;

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    https: httpsOptions,
  },
  build: {
    outDir: "docs",
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporters: ["default", "html"],
      exclude: ["vite.config.js", "node_modules/", "tests/", "docs/", "public/"],
      enabled: true,
    },
  },
});
