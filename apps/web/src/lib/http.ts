import type { ApiResponse } from "@stackquotes/types";
import { supabase, apiBaseUrl, supabaseAnonKey } from "./supabase";

async function buildHeaders(init: RequestInit): Promise<Headers> {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (supabaseAnonKey) {
    headers.set("apikey", supabaseAnonKey);
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return headers;
}

async function performFetch(path: string, init: RequestInit): Promise<Response> {
  const headers = await buildHeaders(init);
  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });
}

async function refreshSession(): Promise<void> {
  await supabase.auth.refreshSession();
}

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  if (isJson) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    const message = typeof body?.error === "string" ? body.error : response.statusText;
    if (response.status === 401) {
      return message || "Your session has expired. Please sign in again.";
    }
    return message || "Request failed";
  }
  const text = await response.text().catch(() => null);
  if (response.status === 401) {
    return text?.trim() || "Your session has expired. Please sign in again.";
  }
  return text?.trim() || response.statusText || "Request failed";
}

async function parseSuccess<T>(response: Response): Promise<ApiResponse<T>> {
  if (response.status === 204) {
    return {} as ApiResponse<T>;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => null);
    return { error: text?.trim() || "Unexpected response format from server." };
  }

  return (await response.json()) as ApiResponse<T>;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const attempt = async (retrying = false): Promise<ApiResponse<T>> => {
    const response = await performFetch(path, init);
    if (response.status === 401 && !retrying) {
      await refreshSession();
      return attempt(true);
    }
    if (!response.ok) {
      const error = await parseError(response);
      return { error };
    }
    return parseSuccess<T>(response);
  };

  return attempt();
}
