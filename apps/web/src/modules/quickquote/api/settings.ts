import type { UserSettings } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const fetchSettings = () => apiFetch<UserSettings | null>("/settings/current");

export const updateSettings = (payload: Partial<UserSettings>) =>
  apiFetch<UserSettings>("/settings/update", {
    method: "POST",
    body: JSON.stringify(payload),
  });

