// apps/web/middleware/auth.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const auth = useAuthStore()
  const publicRoutes = ['/login'] // ✅ all auth routes go here

  // Let the first render happen before we know session state
  if (!auth.initialized) return

  // No session → only allow public routes
  if (!auth.user && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  // Session exists → don’t allow back to login
  if (auth.user && publicRoutes.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
