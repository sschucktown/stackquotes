import type { Context } from "hono";
import { getServiceClient } from "./supabase";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export const requireUser = async (c: Context): Promise<AuthenticatedUser> => {
  const header = c.req.header("authorization") || c.req.header("Authorization");
  if (!header) {
    c.status(401);
    throw new Error("Missing Authorization header");
  }

  const token = header.replace(/bearer /i, "");
  if (!token) {
    c.status(401);
    throw new Error("Missing bearer token");
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    c.status(401);
    throw new Error("Invalid or expired token");
  }

  return { id: data.user.id, email: data.user.email ?? undefined };
};

