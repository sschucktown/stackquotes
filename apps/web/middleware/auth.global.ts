// apps/web/middleware/auth.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const auth = useAuthStore()

  // Only call init once per client session
  if (!auth.user) {
    try {
      await auth.init()
    } catch (err) {
      console.error('Auth init failed in middleware:', err)
    }
  }

  const publicRoutes = ['/login']

  // Redirect unauthenticated users away from protected pages
  if (!auth.user && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  // Redirect logged-in users away from login
  if (auth.user && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
