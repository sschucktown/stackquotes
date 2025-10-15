import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: process.env.NODE_ENV !== "production",
  target: "node20",
  noExternal: ["@stackquotes/db", "@stackquotes/config", "@stackquotes/types"],
  external: ["dotenv"],
  clean: true,
});
