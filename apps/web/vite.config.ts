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
      "@stackquotes/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../../dist"),
    emptyOutDir: true,
  },
});
