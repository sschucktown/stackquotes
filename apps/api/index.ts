// /api/index.ts
import { createApp } from "./src/app.js";

const app = createApp();

// Tell Vercel to treat this as an edge/serverless function
export const config = { runtime: "edge" };

// ✅ Vercel expects a default export with a fetch handler
export default app;
