// apps/web/middleware/auth.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const auth = useAuthStore()
  const publicRoutes = ['/login']

  // ⏳ If not initialized yet, let page render (no redirect flash)
  if (!auth.initialized) return

  if (!auth.user && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
  if (auth.user && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
