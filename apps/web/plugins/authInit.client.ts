// apps/web/plugins/auth-init.client.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    console.log('🚀 Running auth.init() after Nuxt is ready')
    const auth = useAuthStore()
    auth.init()
  })
})
