<template>
<div>
<label class="block text-sm mb-2">Company Logo</label>
<input type="file" accept="image/*" @change="onFile" />
<div v-if="url" class="mt-3">
<img :src="url" class="h-16 object-contain" />
</div>
</div>
</template>
<script setup lang="ts">
const model = defineModel<string | null>('url', { default: null })
const sb = useSb()


const onFile = async (e: Event) => {
const file = (e.target as HTMLInputElement).files?.[0]
if (!file) return
const ext = file.name.split('.').pop()
const path = `logos/${crypto.randomUUID()}.${ext}`
const { error } = await sb.storage.from('assets').upload(path, file, { upsert: true })
if (error) throw error
const { data } = sb.storage.from('assets').getPublicUrl(path)
model.value = data.publicUrl
}
</script>
