// apps/web/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const auth = useAuthStore()
  await auth.init()

  // ⏳ Wait for auth loading
  if (auth.loading) {
    console.log('⏳ Auth still loading...')
    return
  }

  const publicRoutes = ['/login']

  if (!auth.user && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
  if (auth.user && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
