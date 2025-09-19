<script setup>
  const config = useRuntimeConfig()
if (process.client) {
  console.log('Supabase URL:', config.public.supabaseUrl)
  console.log('Supabase Key exists?', !!config.public.supabaseAnonKey)
}
navigateTo('/dashboard')
</script>
