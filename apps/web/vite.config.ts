import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@modules": path.resolve(__dirname, "src/modules"),
      "@stackquotes/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@stackquotes/config": path.resolve(__dirname, "../../packages/config/src"),
      "@stackquotes/types": path.resolve(__dirname, "../../packages/types/src")
    }
  },
  build: {
    // ✅ Keep the output local to apps/web
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html")
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8787",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, "")
      }
    }
  },
  preview: {
    port: 4173
  }
});
