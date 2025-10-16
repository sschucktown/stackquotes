import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// ✅ Single source for your local API target
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8787";

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

    // ✅ This prevents OAuth redirect URLs (e.g. /auth/callback) from downloading as files
    fs: {
      strict: false,
    },
    historyApiFallback: true, // 👈 ensures SPA routes fallback to index.html

    // ✅ Proxy API requests to Hono backend
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        // Keep `/api` in the URL so your Hono routes match
        rewrite: (path) => path
      }
    }
  },

  preview: {
    port: 4173
  }
});
