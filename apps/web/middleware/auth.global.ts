// apps/web/middleware/auth.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) {
    console.log('🔐 Middleware skipped (server-side)')
    return
  }

  const auth = useAuthStore()
  const publicRoutes = ['/login']

  console.log('🔐 Middleware check:', { initialized: auth.initialized, user: auth.user, path: to.path })

  // Let the first render happen before we know session state
  if (!auth.initialized) {
    console.log('⏳ Auth not initialized yet, allowing access to:', to.path)
    return
  }

  // No session → only allow public routes
  if (!auth.user && !publicRoutes.includes(to.path)) {
    console.log('🚫 No user, redirecting to /login')
    return navigateTo('/login')
  }

  // Session exists → don’t allow back to login
  if (auth.user && publicRoutes.includes(to.path)) {
    console.log('✅ User logged in, redirecting to /dashboard')
    return navigateTo('/dashboard')
  }

  console.log('✅ Middleware passed for route:', to.path)
})
