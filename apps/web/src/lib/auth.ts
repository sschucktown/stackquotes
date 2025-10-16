import { supabase } from "./supabase";
import { ref, computed } from "vue";
import type { User, Session } from "@supabase/supabase-js";

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const loading = ref(true);

supabase.auth.getSession().then(({ data }) => {
  session.value = data.session;
  user.value = data.session?.user ?? null;
  loading.value = false;
});

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
  user.value = newSession?.user ?? null;
});

export const useAuth = () => {
  const isAuthenticated = computed(() => Boolean(user.value));
  const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email: string, password: string) => supabase.auth.signUp({ email, password });
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

  const signInWithGoogle = (redirectPath?: string) => {
    const target = sanitizeRedirect(redirectPath) ?? "/quickquote";
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
  };
};
