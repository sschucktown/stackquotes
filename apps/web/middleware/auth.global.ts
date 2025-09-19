// apps/web/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const auth = useAuthStore()
  await auth.init()   // single source of truth

  const publicRoutes = ['/login']

  if (!auth.user && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
  if (auth.user && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
