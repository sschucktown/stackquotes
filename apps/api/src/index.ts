import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";

const app = createApp();

export const config = { runtime: "edge" };

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 8787);
  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`[api] StackQuotes API running on http://localhost:${port}`);
}

const handler = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url ?? "/", `https://${req.headers.host ?? "localhost"}`);
    const init: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers: req.headers as HeadersInit,
    };
    if (req.method && !["GET", "HEAD"].includes(req.method)) {
      init.body = req as unknown as BodyInit;
      init.duplex = "half";
    }
    const request = new Request(url, init);
    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (!response.body) {
      res.end();
      return;
    }

    const stream = Readable.fromWeb(response.body as NodeReadableStream);
    stream.once("error", (error) => {
      console.error("[api] response streaming error", error);
      res.destroy(error as Error);
    });
    stream.pipe(res);
  } catch (error) {
    console.error("[api] request handling error", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};

export default handler;
export type AppType = typeof app;
export { createApp } from "./app.js";
