import type { ApiResponse } from "@stackquotes/types";
import { supabase, apiBaseUrl } from "./supabase";

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      return { error: error.error ?? response.statusText };
    }
    const text = await response.text().catch(() => null);
    return { error: text?.trim() || response.statusText || "Request failed" };
  }

  if (response.status === 204) {
    return {} as ApiResponse<T>;
  }

  if (!isJson) {
    const text = await response.text().catch(() => null);
    return { error: text?.trim() || "Unexpected response format from server." };
  }

  return (await response.json()) as ApiResponse<T>;
}
