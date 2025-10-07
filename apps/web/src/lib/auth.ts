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
  const signInWithGoogle = (redirectPath?: string) => {
    const target = typeof redirectPath === "string" && redirectPath.startsWith("/") ? redirectPath : "/quickquote";
    const redirectUrl = new URL(`${window.location.origin}/login`);
    redirectUrl.searchParams.set("redirect", target);
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
  };
};

