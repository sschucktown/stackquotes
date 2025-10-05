import type { PdfPayload } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const generatePdf = (estimateId: string) =>
  apiFetch<PdfPayload>("/pdf/generate", {
    method: "POST",
    body: JSON.stringify({ estimateId }),
  });

