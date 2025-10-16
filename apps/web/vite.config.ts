import { defineConfig, type ViteDevServer } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import history from "connect-history-api-fallback";

const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8787";

export default defineConfig({
  plugins: [
    vue(),
    // ✅ Add history fallback as a plugin so TypeScript and Vite both recognize it
    {
      name: "spa-fallback",
      configureServer(server: ViteDevServer) {
        server.middlewares.use(
          history({
            rewrites: [
              // leave API routes alone
              { from: /^\/api\/.*$/, to: (context) => context.parsedUrl.pathname },
            ],
            disableDotRule: true,
            htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
          })
        );
      },
    },
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@modules": path.resolve(__dirname, "src/modules"),
      "@stackquotes/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@stackquotes/config": path.resolve(__dirname, "../../packages/config/src"),
      "@stackquotes/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (p) => p,
      },
    },
  },

  preview: {
    port: 4173,
  },
});
