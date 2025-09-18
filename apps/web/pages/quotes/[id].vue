<template>
<div class="grid md:grid-cols-3 gap-6">
<section class="md:col-span-2 bg-white p-6 rounded-xl shadow">
<h2 class="text-xl font-semibold text-header mb-4">Quote Builder</h2>
<QuoteForm :quote-id="route.params.id as string" />
</section>
<section class="bg-white p-6 rounded-xl shadow">
<h3 class="font-semibold mb-2 text-header">Actions</h3>
<div class="space-y-2">
<a class="btn w-full" :href="`/api/pdf/${route.params.id}`" target="_blank">Export PDF</a>
<form method="post" :action="'/api/stripe/checkout'">
<input type="hidden" name="quoteId" :value="route.params.id" />
<button class="btn w-full">Create Deposit Checkout</button>
</form>
</div>
</section>
</div>
</template>
<script setup lang="ts">
const route = useRoute()
</script>
