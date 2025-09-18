export default defineNuxtRouteMiddleware(async (to) => {
if (process.server) return
const sb = useSb()
const { data: { user } } = await sb.auth.getUser()
const isAuth = !!user
const publicRoutes = ['/login']
if (!isAuth && !publicRoutes.includes(to.path)) return navigateTo('/login')
if (isAuth && to.path === '/login') return navigateTo('/dashboard')
})
