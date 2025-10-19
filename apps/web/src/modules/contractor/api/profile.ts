import type { ApiResponse, ContractorProfile } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

const profileEndpoint = "/contractor/profile";

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read file data"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read the selected file"));
    reader.readAsDataURL(file);
  });

export const fetchContractorProfile = () => apiFetch<ContractorProfile | null>(`${profileEndpoint}`);

export const upsertContractorProfile = (payload: Partial<ContractorProfile>) =>
  apiFetch<ContractorProfile>(`${profileEndpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const uploadContractorLogo = async (file: File) => {
  const dataUrl = await readFileAsDataUrl(file);
  return apiFetch<ContractorProfile>("/contractor/logo", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      data: dataUrl,
    }),
  }) as Promise<ApiResponse<ContractorProfile> & { publicUrl?: string }>;
};

