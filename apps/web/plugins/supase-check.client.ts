export default defineNuxtPlugin((nuxtApp) => {
  try {
    const client = useSupabaseClient()
    console.log("✅ Supabase client available at plugin init:", client)
  } catch (err) {
    console.error("❌ Supabase client NOT available at plugin init:", err)
  }
})
