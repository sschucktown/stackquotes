<script setup lang="ts">
const props = defineProps<{
  depositMode: "percent" | "flat" | "none";
  depositPercent: number;
  depositFlat: number;
  baseAmount: number;
}>();

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const computedDeposit = () => {
  if (props.depositMode === "flat") return props.depositFlat;
  if (props.depositMode === "percent") return Math.round((props.depositPercent / 100) * props.baseAmount);
  return 0;
};
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit preview</p>
        <h3 class="text-lg font-semibold text-slate-900">Client sees this at approval</h3>
        <p class="text-sm text-slate-600">Editor lives elsewhere — this is just the preview.</p>
      </div>
      <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">Preview</span>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Mode</p>
        <p class="text-sm font-semibold text-slate-900">
          {{ depositMode === "none" ? "Added later" : depositMode === "flat" ? "Flat amount" : "Percent of option" }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Preview amount</p>
        <p class="text-lg font-bold text-slate-900">
          {{ depositMode === "none" ? "Pending" : formatCurrency(computedDeposit()) }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Client wording</p>
        <p class="text-sm text-slate-700">
          <span v-if="depositMode === 'percent'">
            Client sees {{ depositPercent }}% (~{{ formatCurrency(computedDeposit()) }}) due at approval.
          </span>
          <span v-else-if="depositMode === 'flat'">
            Client sees a flat {{ formatCurrency(depositFlat) }} deposit when they accept.
          </span>
          <span v-else>
            Deposit is scheduled after scope is locked. Client won't be prompted yet.
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
