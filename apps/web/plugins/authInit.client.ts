export default defineNuxtPlugin(() => {
  if (process.server) return
  const auth = useAuthStore()
  auth.init().catch(err => console.error('Auth init failed:', err))
})
