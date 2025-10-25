import { apiFetch } from "./http";

const WISESTACK_SANDBOX_URL = "https://sandbox.wisetack.com/apply";

export interface WisetackLaunchOptions {
  contractorId: string;
  proposalId: string;
  amountCents: number;
  customerName?: string | null;
  customerEmail?: string | null;
}

const loadScript = async (): Promise<void> => {
  if (typeof window === "undefined") return;
  if (window.Wisetack) return;
  const id = "wisetack-sdk";
  if (document.getElementById(id)) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sandbox-assets.wisetack.com/web-sdk/v1/wisetack.js";
    script.async = true;
    script.id = id;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Wisetack SDK"));
    document.head.appendChild(script);
  }).catch(() => {
    // fallback to no-op if script fails
  });
};

const openFallbackWindow = (referenceId: string) => {
  const url = `${WISESTACK_SANDBOX_URL}?reference=${encodeURIComponent(referenceId)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

export const launchWisetackFinancing = async (options: WisetackLaunchOptions) => {
  if (typeof window === "undefined") return;
  await loadScript();
  const referenceId = `${options.proposalId}-${Date.now()}`;

  await apiFetch("/wisetack/telemetry", {
    method: "POST",
    body: JSON.stringify({
      contractor_id: options.contractorId,
      proposal_id: options.proposalId,
      kind: "application_started",
      amount_cents: options.amountCents,
      metadata: {
        customer_name: options.customerName ?? null,
        customer_email: options.customerEmail ?? null,
      },
    }),
  });

  if (window.Wisetack?.openModal) {
    try {
      window.Wisetack.openModal({
        amount: options.amountCents,
        referenceId,
        customer: {
          name: options.customerName ?? undefined,
          email: options.customerEmail ?? undefined,
        },
      });
      return;
    } catch (error) {
      console.warn("[wisetack] modal launch failed, falling back", error);
    }
  }

  openFallbackWindow(referenceId);
};

declare global {
  interface Window {
    Wisetack?: {
      openModal?: (options: {
        amount: number;
        referenceId: string;
        customer?: { name?: string; email?: string };
      }) => void;
    };
  }
}

