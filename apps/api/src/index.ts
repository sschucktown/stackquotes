import { createApp } from "./app.js";
import { handle } from "@hono/node-server/vercel";

const app = createApp();

export const config = {
  runtime: "nodejs18.x",
};

export default handle(app);

if (!process.env.VERCEL) {
  import("@hono/node-server").then(({ serve }) => {
    const port = Number(process.env.PORT ?? 8787);
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(`[api] StackQuotes API running on http://localhost:${port}`);
  });
}
export type AppType = typeof app;
export { createApp } from "./app.js";
