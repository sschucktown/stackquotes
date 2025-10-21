const ANON_STORAGE_KEY = "stackquotes:anon-session";

type AnalyticsTarget =
  | {
      capture?: (event: string, properties?: Record<string, unknown>) => void;
    }
  | undefined;

type AnalyticsPayload = Record<string, unknown>;

const ensureAnonymousId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const storage = window.sessionStorage;
    const existing = storage.getItem(ANON_STORAGE_KEY);
    if (existing) return existing;
    const id = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    storage.setItem(ANON_STORAGE_KEY, id);
    return id;
  } catch {
    return undefined;
  }
};

const getAnalyticsTargets = () => {
  if (typeof window === "undefined") {
    return { posthog: undefined, analytics: undefined };
  }
  const w = window as typeof window & {
    posthog?: AnalyticsTarget;
    analytics?: { track?: (event: string, properties?: Record<string, unknown>) => void };
  };
  return {
    posthog: w.posthog,
    analytics: w.analytics,
  };
};

export const trackEvent = (eventName: string, properties: AnalyticsPayload = {}) => {
  if (!eventName) return;
  const anonId = ensureAnonymousId();
  const payload = {
    anon_id: anonId,
    ...properties,
  };
  const targets = getAnalyticsTargets();
  let tracked = false;
  if (targets.posthog?.capture) {
    targets.posthog.capture(eventName, payload);
    tracked = true;
  }
  if (!tracked && targets.analytics?.track) {
    targets.analytics.track(eventName, payload);
    tracked = true;
  }
  if (!tracked && typeof console !== "undefined") {
    console.debug("[analytics]", eventName, payload);
  }
};

export const getAnonymousId = () => ensureAnonymousId();
