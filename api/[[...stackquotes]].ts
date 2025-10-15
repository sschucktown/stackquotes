/// <reference types="node" />

import { handle } from "@hono/node-server/vercel";

type NodeHandler = ReturnType<typeof handle>;

let cachedHandler: NodeHandler | null = null;

const getHandler = async (): Promise<NodeHandler> => {
  if (!cachedHandler) {
    const { createApp } = await import("../apps/api/dist/index.js");
    cachedHandler = handle(createApp());
  }
  return cachedHandler;
};

export const config = {
  runtime: "nodejs",
  includeFiles: ["apps/api/dist/**"],
};

export default async function stackquotes(
  req: Parameters<NodeHandler>[0],
  res: Parameters<NodeHandler>[1]
) {
  const handler = await getHandler();
  return handler(req, res);
}
