// apps/web/plugins/authInit.client.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  if (process.server) return

  const auth = useAuthStore()
  // Wait for session restore
  await auth.init()
})
