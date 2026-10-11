import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import { offlinePlugin } from "./pwa-plugin.js";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), offlinePlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    outDir: "../wwwroot",
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      "/api": "https://localhost:7009"
    }
  }
});
