// vite.config.ts
import { defineConfig } from "file:///C:/Dev/Projects/stackquotes/node_modules/.pnpm/vite@5.4.20_@types+node@20.19.19/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Dev/Projects/stackquotes/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vi_8c3a3ccb2b2d1abc43c3685fdf5594ea/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import history from "file:///C:/Dev/Projects/stackquotes/node_modules/.pnpm/connect-history-api-fallback@2.0.0/node_modules/connect-history-api-fallback/lib/index.js";
var __vite_injected_original_dirname = "C:\\Dev\\Projects\\stackquotes\\apps\\web";
var API_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8787";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    // ✅ Add history fallback as a plugin so TypeScript and Vite both recognize it
    {
      name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use(
          history({
            rewrites: [
              // leave API routes alone
              { from: /^\/api\/.*$/, to: (context) => context.parsedUrl.pathname }
            ],
            disableDotRule: true,
            htmlAcceptHeaders: ["text/html", "application/xhtml+xml"]
          })
        );
      }
    }
  ],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "@modules": path.resolve(__vite_injected_original_dirname, "src/modules"),
      "@stackquotes/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@stackquotes/config": path.resolve(__vite_injected_original_dirname, "../../packages/config/src"),
      "@stackquotes/types": path.resolve(__vite_injected_original_dirname, "../../packages/types/src")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__vite_injected_original_dirname, "index.html")
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (p) => p
      }
    }
  },
  preview: {
    port: 4173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxEZXZcXFxcUHJvamVjdHNcXFxcc3RhY2txdW90ZXNcXFxcYXBwc1xcXFx3ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXERldlxcXFxQcm9qZWN0c1xcXFxzdGFja3F1b3Rlc1xcXFxhcHBzXFxcXHdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovRGV2L1Byb2plY3RzL3N0YWNrcXVvdGVzL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7XHVGRUZGaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgdnVlIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWVcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IGhpc3RvcnkgZnJvbSBcImNvbm5lY3QtaGlzdG9yeS1hcGktZmFsbGJhY2tcIjtcclxuXHJcbmNvbnN0IEFQSV9UQVJHRVQgPSBwcm9jZXNzLmVudi5WSVRFX0FQSV9QUk9YWV9UQVJHRVQgPz8gXCJodHRwOi8vbG9jYWxob3N0Ojg3ODdcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICAvLyBcdTI3MDUgQWRkIGhpc3RvcnkgZmFsbGJhY2sgYXMgYSBwbHVnaW4gc28gVHlwZVNjcmlwdCBhbmQgVml0ZSBib3RoIHJlY29nbml6ZSBpdFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcInNwYS1mYWxsYmFja1wiLFxyXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XHJcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShcclxuICAgICAgICAgIGhpc3Rvcnkoe1xyXG4gICAgICAgICAgICByZXdyaXRlczogW1xyXG4gICAgICAgICAgICAgIC8vIGxlYXZlIEFQSSByb3V0ZXMgYWxvbmVcclxuICAgICAgICAgICAgICB7IGZyb206IC9eXFwvYXBpXFwvLiokLywgdG86IChjb250ZXh0KSA9PiBjb250ZXh0LnBhcnNlZFVybC5wYXRobmFtZSB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBkaXNhYmxlRG90UnVsZTogdHJ1ZSxcclxuICAgICAgICAgICAgaHRtbEFjY2VwdEhlYWRlcnM6IFtcInRleHQvaHRtbFwiLCBcImFwcGxpY2F0aW9uL3hodG1sK3htbFwiXSxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcblxuICBlbnZQcmVmaXg6IFtcIlZJVEVfXCIsIFwiTkVYVF9QVUJMSUNfXCJdLFxuXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICBcIkBtb2R1bGVzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL21vZHVsZXNcIiksXHJcbiAgICAgIFwiQHN0YWNrcXVvdGVzL3VpXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvdWkvc3JjXCIpLFxyXG4gICAgICBcIkBzdGFja3F1b3Rlcy9jb25maWdcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy9jb25maWcvc3JjXCIpLFxyXG4gICAgICBcIkBzdGFja3F1b3Rlcy90eXBlc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3R5cGVzL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogXCJkaXN0XCIsXHJcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGlucHV0OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImluZGV4Lmh0bWxcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIGhvc3Q6IHRydWUsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGlcIjoge1xyXG4gICAgICAgIHRhcmdldDogQVBJX1RBUkdFVCxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHApID0+IHAsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIHByZXZpZXc6IHtcclxuICAgIHBvcnQ6IDQxNzMsXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlMsU0FBUyxvQkFBd0M7QUFDNVYsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGFBQWE7QUFIcEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxhQUFhLFFBQVEsSUFBSSx5QkFBeUI7QUFFeEQsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBO0FBQUEsSUFFSjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQXVCO0FBQ3JDLGVBQU8sWUFBWTtBQUFBLFVBQ2pCLFFBQVE7QUFBQSxZQUNOLFVBQVU7QUFBQTtBQUFBLGNBRVIsRUFBRSxNQUFNLGVBQWUsSUFBSSxDQUFDLFlBQVksUUFBUSxVQUFVLFNBQVM7QUFBQSxZQUNyRTtBQUFBLFlBQ0EsZ0JBQWdCO0FBQUEsWUFDaEIsbUJBQW1CLENBQUMsYUFBYSx1QkFBdUI7QUFBQSxVQUMxRCxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsV0FBVyxDQUFDLFNBQVMsY0FBYztBQUFBLEVBRW5DLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUNsQyxZQUFZLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDakQsbUJBQW1CLEtBQUssUUFBUSxrQ0FBVyx1QkFBdUI7QUFBQSxNQUNsRSx1QkFBdUIsS0FBSyxRQUFRLGtDQUFXLDJCQUEyQjtBQUFBLE1BQzFFLHNCQUFzQixLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsSUFDMUU7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixPQUFPLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsSUFDN0M7QUFBQSxFQUNGO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsTUFBTTtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
