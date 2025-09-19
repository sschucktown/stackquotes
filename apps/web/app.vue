<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

onMounted(() => {
  const auth = useAuthStore()
  auth.safeInit()
})
</script>
