// apps/web/composables/useSb.ts
export const useSb = () => {
  const { $supabase } = useNuxtApp()
  if (!$supabase) throw new Error('Supabase client not found')
  return $supabase
}
