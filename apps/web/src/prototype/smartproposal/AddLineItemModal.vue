<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { LineItem, OptionKey } from "./types";

const props = defineProps<{
  open: boolean;
  defaultTarget?: OptionKey | "all" | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "add", payload: { target: OptionKey | "all"; item: LineItem }): void;
}>();

const markup = ref(1.65);
const priceTouched = ref(false);
const form = reactive<LineItem>({
  id: "",
  name: "",
  desc: "",
  cost: 0,
  price: 0,
  included: true,
  category: "upgrade",
});

const suggestedPrice = computed(() => Math.round((form.cost || 0) * markup.value));

watch(
  () => form.cost,
  () => {
    if (!priceTouched.value) {
      form.price = suggestedPrice.value;
    }
  }
);

const reset = () => {
  form.id = "";
  form.name = "";
  form.desc = "";
  form.cost = 0;
  form.price = 0;
  form.included = true;
  form.category = "upgrade";
  priceTouched.value = false;
};

const emitAdd = (target: OptionKey | "all") => {
  if (!form.name.trim()) return;
  const id = `${target}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  emit("add", {
    target,
    item: {
      ...form,
      id,
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
      included: true,
    },
  });
  reset();
  emit("close");
};
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Add line item</p>
          <h3 class="text-lg font-semibold text-slate-900">Quick add to an option</h3>
          <p class="text-sm text-slate-600">Markup suggests a selling price from your cost.</p>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Item name</label>
          <input
            v-model="form.name"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
            placeholder="Example: Composite surface"
          />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Category</label>
          <select
            v-model="form.category"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
          >
            <option value="structure">Structure</option>
            <option value="surface">Surface</option>
            <option value="hardware">Hardware</option>
            <option value="upgrade">Upgrade</option>
          </select>
        </div>
      </div>

      <div class="mt-3">
        <label class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Description</label>
        <textarea
          v-model="form.desc"
          class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
          rows="3"
          placeholder="Short supporting details for the client"
        />
      </div>

      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Cost</label>
          <input
            v-model.number="form.cost"
            type="number"
            min="0"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
          />
        </div>
        <div class="space-y-2">
          <label class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Price
            <span class="text-[11px] font-semibold text-blue-700">Suggested {{ suggestedPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</span>
          </label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
            @input="priceTouched.value = true"
          />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Markup</label>
          <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              v-model.number="markup"
              type="number"
              min="1"
              step="0.05"
              class="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-slate-300"
            />
            <span class="text-xs text-slate-500">x</span>
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div class="text-xs text-slate-500">Send to an option. Items start enabled and can be toggled off later.</div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="emitAdd('good')"
          >
            Add to Good
          </button>
          <button
            type="button"
            class="rounded-full border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            @click="emitAdd('better')"
          >
            Add to Better
          </button>
          <button
            type="button"
            class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            @click="emitAdd('best')"
          >
            Add to Best
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-300 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
            @click="emitAdd('all')"
          >
            Add to All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
