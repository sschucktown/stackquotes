import { loadServerConfig } from "@stackquotes/config";

const DEFAULT_BASE_URL = "https://sandbox.api.wisetack.com/v2";
const PROD_BASE_URL = "https://api.wisetack.com/v2";

type WisetackEnv = "sandbox" | "production";

interface WisetackRequestOptions extends RequestInit {
  path: string;
}

export interface WisetackLoanApplicationInput {
  amountCents: number;
  referenceId: string;
  customer: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
  };
  metadata?: Record<string, unknown>;
}

export interface WisetackLoanApplicationResponse {
  applicationUrl: string;
  id: string;
  status: string;
}

const getConfig = () => {
  const config = loadServerConfig();
  const partnerId = config.WISESTACK_PARTNER_ID ?? "";
  const apiKey = config.WISESTACK_API_KEY ?? "";
  const env = (config.WISESTACK_ENV ?? "sandbox") as WisetackEnv;
  const hasCredentials = Boolean(partnerId && apiKey);
  const baseUrl = env === "production" ? PROD_BASE_URL : DEFAULT_BASE_URL;
  return { partnerId, apiKey, env, hasCredentials, baseUrl };
};

const buildAuthHeader = (partnerId: string, apiKey: string) => {
  const token = Buffer.from(`${partnerId}:${apiKey}`).toString("base64");
  return `Basic ${token}`;
};

const wisetackRequest = async <T>(options: WisetackRequestOptions): Promise<T | null> => {
  const config = getConfig();
  if (!config.hasCredentials) {
    console.warn("[wisetack] credentials are not configured; request skipped");
    return null;
  }

  const url = `${config.baseUrl}${options.path}`;
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", buildAuthHeader(config.partnerId, config.apiKey));

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    console.error("[wisetack] request failed", response.status, message);
    throw new Error(`Wisetack request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
};

export const createSandboxLoanApplication = async (
  input: WisetackLoanApplicationInput
): Promise<WisetackLoanApplicationResponse | null> => {
  const payload = {
    amount: Math.max(Math.round(input.amountCents), 0),
    reference_id: input.referenceId,
    customer: {
      first_name: input.customer.firstName,
      last_name: input.customer.lastName,
      email: input.customer.email ?? undefined,
      phone: input.customer.phone ?? undefined,
    },
    metadata: input.metadata ?? {},
  };

  return wisetackRequest<WisetackLoanApplicationResponse>({
    path: "/loan-applications",
    method: "POST",
    body: JSON.stringify(payload),
  });
};

