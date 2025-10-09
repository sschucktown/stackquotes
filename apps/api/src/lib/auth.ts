import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getServiceClient } from "./supabase.js";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export const requireUser = async (c: Context): Promise<AuthenticatedUser> => {
  const header = c.req.header("authorization") || c.req.header("Authorization");
  if (!header) {
    throw new HTTPException(401, { message: "Missing Authorization header" });
  }

  const token = header.replace(/bearer /i, "");
  if (!token) {
    throw new HTTPException(401, { message: "Missing bearer token" });
  }

  const supabase = getServiceClient();
  const { data, error } = await (supabase.auth as { getUser: (jwt: string) => Promise<{
    data: { user: { id: string; email?: string | null } | null };
    error: Error | null;
  }> }).getUser(token);
  if (error || !data?.user) {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }

  return { id: data.user.id, email: data.user.email ?? undefined };
};

