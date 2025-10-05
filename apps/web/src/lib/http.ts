import type { ApiResponse } from "@stackquotes/types";
import { supabase, apiBaseUrl } from "./supabase";

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    return { error: error.error ?? response.statusText };
  }

  return response.json();
}

