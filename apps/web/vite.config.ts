import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "dist"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@stackquotes/config": path.resolve(__dirname, "../../packages/config/src")
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
