<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{
  open: boolean;
  optionName: string;
  price: number;
  deposit: number | null;
  onClose: () => void;
}>()

const emit = defineEmits<{
  (e: "continue"): void;
}>()

const accepted = ref(false);

const formattedPrice = computed(() =>
  props.price.toLocaleString("en-US", { style: "currency", currency: "USD" })
);

const formattedDeposit = computed(() =>
  props.deposit
    ? props.deposit.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "None"
);

// When drawer closes → reset checkbox
watch(() => props.open, (val) => {
  if (!val) accepted.value = false;
});
</script>

<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
    @click="onClose"
  />

  <!-- Drawer -->
  <aside
    class="fixed bottom-0 left-0 w-full max-h-[88vh] bg-white rounded-t-2xl shadow-2xl z-50 
           transform transition-transform duration-300 overflow-hidden"
    :class="open ? 'translate-y-0' : 'translate-y-full'"
  >
    <!-- Handle -->
    <div class="w-full flex justify-center py-3">
      <div class="h-1.5 w-12 rounded-full bg-slate-300"></div>
    </div>

    <!-- Inner content -->
    <div class="px-6 pb-10 overflow-y-auto max-h-[calc(88vh-3rem)] space-y-8">

      <!-- Title -->
      <header>
        <h2 class="text-xl font-semibold text-slate-900">Agreement Summary</h2>
        <p class="text-sm text-slate-500">
          Please review the important project terms before signing.
        </p>
      </header>

      <!-- Scope Summary -->
      <section class="space-y-2">
        <h3 class="text-sm font-semibold text-slate-700">Selected Option</h3>
        <p class="text-slate-800 text-base font-medium">
          {{ optionName }} — {{ formattedPrice }}
        </p>
      </section>

      <!-- Deposit -->
      <section class="space-y-2">
        <h3 class="text-sm font-semibold text-slate-700">Deposit Terms</h3>
        <p class="text-slate-700 text-sm leading-relaxed">
          Deposit Due: <strong>{{ formattedDeposit }}</strong><br />
          The deposit reserves your project on the contractor’s schedule. Deposits are applied to
          the total project cost and are refundable only if cancellation occurs within 48 hours of signing.
        </p>
      </section>

      <!-- Change Orders -->
      <section class="space-y-2">
        <h3 class="text-sm font-semibold text-slate-700">Change Orders</h3>
        <p class="text-slate-700 text-sm leading-relaxed">
          Any changes to materials, scope, or layout must be approved in writing. Additional costs
          will be billed at the contractor’s standard rates and must be agreed to before work continues.
        </p>
      </section>

      <!-- Warranty -->
      <section class="space-y-2">
        <h3 class="text-sm font-semibold text-slate-700">Warranty</h3>
        <p class="text-slate-700 text-sm leading-relaxed">
          Contractor provides a standard workmanship warranty. Manufacturer warranties apply to
          all materials used. Warranty does not cover misuse, weather events, or lack of maintenance.
        </p>
      </section>

      <!-- Scheduling -->
      <section class="space-y-2">
        <h3 class="text-sm font-semibold text-slate-700">Scheduling Note</h3>
        <p class="text-slate-700 text-sm leading-relaxed">
          All start dates are tentative until materials availability and weather are confirmed.
          Contractor will reach out promptly after approval to narrow down the exact start window.
        </p>
      </section>

      <!-- Checkbox -->
      <section>
        <label class="flex items-start gap-3 cursor-pointer select-none">
          <input 
            type="checkbox"
            v-model="accepted"
            class="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
          >
          <span class="text-slate-700 text-sm leading-relaxed">
            I have reviewed and agree to the terms above.
          </span>
        </label>
      </section>

      <!-- Continue Button -->
      <button
        class="w-full rounded-xl py-3 font-semibold text-white shadow 
               transition bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
        :disabled="!accepted"
        @click="emit('continue')"
      >
        Continue to Signature
      </button>

      <!-- Close -->
      <button
        class="w-full mt-2 rounded-xl py-3 font-semibold text-slate-600 
               bg-slate-100 hover:bg-slate-200 transition"
        @click="onClose"
      >
        Cancel
      </button>

    </div>
  </aside>
</template>
