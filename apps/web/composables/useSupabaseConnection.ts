// apps/web/composables/useSupabaseConnection.ts
export const useSupabaseConnection = async () => {
  const nuxtApp = useNuxtApp()
  const supabase = nuxtApp.$supabase

  // Get a trivial request (current timestamp)
  const { data, error } = await supabase.from('pg_stat_activity').select('now()').limit(1)

  return {
    url: supabase.restUrl,
    hasError: !!error,
    errorMessage: error?.message,
    testData: data
  }
}
