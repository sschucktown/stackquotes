/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from "node:http";

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;

let cachedHandler: NodeHandler | null = null;

const getHandler = async (): Promise<NodeHandler> => {
  if (!cachedHandler) {
    const mod = await import("../apps/api/dist/index.js");
    const exported = mod.default ?? mod.handler;
    if (typeof exported !== "function") {
      throw new Error("apps/api/dist/index.js does not export a default handler function");
    }
    cachedHandler = exported as NodeHandler;
  }
  return cachedHandler;
};

export const config = {
  runtime: "nodejs",
  includeFiles: ["apps/api/dist/**"],
};

export default async function stackquotes(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const handler = await getHandler();
  return handler(req, res);
}
