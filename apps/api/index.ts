// apps/api/index.ts

import { createApp } from "./src/app";

/**
 * Create the Hono app
 */
const app = createApp();

/**
 * ✅ Vercel expects a fetch handler
 * NOT the app object
 */
export default app.fetch;

/**
 * ✅ Must be Node runtime
 * (Supabase service role, DB access, etc.)
 */
export const config = {
  runtime: "nodejs",
};
