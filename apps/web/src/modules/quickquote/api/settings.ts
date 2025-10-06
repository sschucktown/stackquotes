import type { UserSettings } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const fetchSettings = () => apiFetch<UserSettings | null>("/settings/current");

export const updateSettings = (payload: Partial<UserSettings>) =>
  apiFetch<UserSettings>("/settings/update", {
    method: "POST",
    body: JSON.stringify(payload),
  });

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read file data"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read the selected file"));
    };
    reader.readAsDataURL(file);
  });
}

export const uploadLogo = async (file: File) => {
  const dataUrl = await readFileAsDataUrl(file);
  return apiFetch<UserSettings>("/settings/logo/upload", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      data: dataUrl,
    }),
  });
};

