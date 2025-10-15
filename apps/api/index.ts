// /api/index.ts
import { createApp } from "../apps/api/src/app.js"; // <-- leave for runtime only
// ⬆️ Vercel will resolve this at build time even if TS can't; we’ll silence TS below

// Tell TypeScript to ignore this missing type
// @ts-ignore
const app = createApp();

export const config = { runtime: "edge" };
export default app;
