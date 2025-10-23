import { loadServerConfig } from "@stackquotes/config";
import type { Context } from "hono";

export const getBaseAppUrl = (): string => {
  const config = loadServerConfig();
  const base =
    config.BASE_APP_URL ||
    (config.BASE_API_URL ? config.BASE_API_URL.replace(/\/api$/, "") : null) ||
    "https://stackquotes.app";
  return base.replace(/\/$/, "");
};

export const readJsonBody = async (c: Context): Promise<Record<string, unknown>> => {
  const contentType = c.req.header("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {};
  }
  const parsed = await c.req.json().catch(() => ({}));
  if (parsed && typeof parsed === "object") {
    return parsed as Record<string, unknown>;
  }
  return {};
};

