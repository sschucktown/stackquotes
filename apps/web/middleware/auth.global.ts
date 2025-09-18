export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  const { $supabase } = useNuxtApp()
  const publicRoutes = ['/login']

  // If Supabase isn't configured yet, skip guarding to avoid runtime crash.
  if (!$supabase) return

  const { data: { user } } = await $supabase.auth.getUser()
  if (!user && !publicRoutes.includes(to.path)) return navigateTo('/login')
  if (user && to.path === '/login') return navigateTo('/dashboard')
})
