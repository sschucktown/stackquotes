import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 8787);

serve({
  fetch: app.fetch,
  port,
});

console.log(`[api] StackQuotes API running on http://localhost:${port}`);

export type AppType = typeof app;
export { createApp } from "./app.js";
