// apps/web/composables/useSupabase.ts

// Google OAuth
export const loginWithGoogle = async () => {
  const supabase = useSupabaseClient()
  console.log("Supabase client:", supabase)
  console.log("Supabase auth object:", supabase.auth)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) {
    console.error("❌ Google login failed:", error)
    throw error
  }
  return data
}

// Email login
export const loginWithEmail = async (email: string, password: string) => {
  const supabase = useSupabaseClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

// Email signup
export const signupWithEmail = async (email: string, password: string) => {
  const supabase = useSupabaseClient()
  return await supabase.auth.signUp({ email, password })
}

// Delete Quotes
export const deleteQuote = async (id: string) => {
  const supabase = useSupabaseClient()
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}
