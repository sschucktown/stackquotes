import { supabase } from "./supabase";
import { apiFetch } from "./http";
import { ref, computed } from "vue";
import type { User, Session } from "@supabase/supabase-js";

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const loading = ref(true);

// Guard to avoid duplicate profile seeding per user id
let lastSeededUserId: string | null = null;
let seedingInFlight = false;

const extractNameFromMetadata = (
  metadata: Record<string, any> | undefined | null
): string | undefined => {
  if (!metadata) return undefined;
  const full = [metadata.full_name, metadata.name].find(
    (v) => typeof v === "string" && v.trim().length
  );
  if (typeof full === "string" && full.trim()) return full.trim();
  const given = typeof metadata.given_name === "string" ? metadata.given_name.trim() : "";
  const family = typeof metadata.family_name === "string" ? metadata.family_name.trim() : "";
  const combined = [given, family].filter(Boolean).join(" ").trim();
  return combined || undefined;
};

const ensureProfileSeed = async (u: User | null) => {
  if (!u) return;
  if (seedingInFlight) return;
  if (lastSeededUserId === u.id) return;
  try {
    seedingInFlight = true;
    const profileRes = await apiFetch<{
      userId: string;
      email: string | null;
      ownerName: string | null;
      businessName: string | null;
      tradeType: string | null;
      trade: string | null;
      averageProjectSize: string | null;
      postalCode: string | null;
      city: string | null;
      state: string | null;
      phone: string | null;
      publicSlug: string | null;
      logoUrl: string | null;
      createdAt: string;
      updatedAt: string;
    } | null>("/contractor/profile");

    const needsEmail = !profileRes.error && (!profileRes.data || !profileRes.data.email);
    const existingOwnerName = !profileRes.error && profileRes.data?.ownerName;
    const nameFromAuth = extractNameFromMetadata(
      (u.user_metadata as Record<string, any> | undefined) ?? undefined
    );
    const needsOwnerName =
      !profileRes.error && (!profileRes.data || !existingOwnerName) && Boolean(nameFromAuth);

    const payload: Record<string, any> = {};
    if (needsEmail && typeof u.email === "string" && u.email.trim()) {
      payload.email = u.email.trim();
    }
    if (needsOwnerName && nameFromAuth) {
      payload.ownerName = nameFromAuth;
    }

    if (Object.keys(payload).length > 0) {
      await apiFetch("/contractor/profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    lastSeededUserId = u.id;
  } catch {
    // Ignore seeding errors; non-blocking
  } finally {
    seedingInFlight = false;
  }
};

supabase.auth.getSession().then(async ({ data }) => {
  session.value = data.session;
  user.value = data.session?.user ?? null;
  loading.value = false;
  await ensureProfileSeed(user.value);
});

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
  user.value = newSession?.user ?? null;
  // Best-effort seeding when auth state changes (e.g., after OAuth redirect)
  void ensureProfileSeed(user.value);
});

export const useAuth = () => {
  const isAuthenticated = computed(() => Boolean(user.value));
  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });
  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password });
  const signOut = () => supabase.auth.signOut();
  const isSafeRedirect = (value?: string): value is string =>
    typeof value === "string" && value.startsWith("/") && !value.startsWith("/api");

  const sanitizeRedirect = (value?: string) => (isSafeRedirect(value) ? value : undefined);

  const redirectStorageKey = "stackquotes:redirect";

  const getStorage = () => {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  };

  const getStoredRedirect = () => {
    const storage = getStorage();
    if (!storage) return undefined;
    const value = storage.getItem(redirectStorageKey) ?? undefined;
    return sanitizeRedirect(value ?? undefined);
  };

  const setStoredRedirect = (value?: string) => {
    const storage = getStorage();
    if (!storage) return;
    const safe = sanitizeRedirect(value);
    if (safe) {
      storage.setItem(redirectStorageKey, safe);
    } else {
      storage.removeItem(redirectStorageKey);
    }
  };

  const clearStoredRedirect = () => {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(redirectStorageKey);
  };

  const defaultRedirect = "/quickquotes";

  const signInWithGoogle = (redirectPath?: string) => {
    const target = sanitizeRedirect(redirectPath) ?? defaultRedirect;
    setStoredRedirect(target);
    const redirectUrl = new URL(`${window.location.origin}/login`);
    redirectUrl.searchParams.set("oauth", "google");
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });
  };

  return {
    user,
    session,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    isSafeRedirect,
    sanitizeRedirect,
    getStoredRedirect,
    setStoredRedirect,
    clearStoredRedirect,
    defaultRedirect,
  };
};

