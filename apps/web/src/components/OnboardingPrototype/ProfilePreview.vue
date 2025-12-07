<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:py-12 lg:px-8">
      <div class="space-y-6">
        <header class="text-center space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Auto-filled profile</p>
          <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">We filled this in for you</h1>
          <p class="text-sm text-slate-600">Double-check anything you want to tweak before we keep building.</p>
        </header>

        <section class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Auto-filled from your upload</span>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                v-if="!editing"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
                @click="handleLooksGood"
              >
                Looks good →
              </button>
              <transition name="fade" mode="out-in">
                <button
                  v-else
                  key="save"
                  class="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  @click="handleSave"
                >
                  Save changes →
                </button>
              </transition>
              <button
                class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                @click="toggleEditing"
              >
                {{ editing ? "Cancel" : "Make changes" }}
              </button>
            </div>
          </div>

          <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800">Business name</label>
              <input
                v-model="form.businessName"
                :disabled="!editing"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800">Trade</label>
              <input
                v-model="form.trade"
                :disabled="!editing"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800">Phone</label>
              <input
                v-model="form.phone"
                :disabled="!editing"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800">Email</label>
              <input
                v-model="form.email"
                :disabled="!editing"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800">Service area</label>
              <input
                v-model="form.serviceArea"
                :disabled="!editing"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800">Payment terms</label>
              <input
                v-model="form.paymentTerms"
                :disabled="!editing"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-semibold text-slate-800">Warranty text</label>
              <textarea
                v-model="form.warranty"
                :disabled="!editing"
                rows="3"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              ></textarea>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const form = reactive({ ...store.businessInfo });
const editing = ref(false);

watch(
  () => store.trade,
  (nextTrade) => {
    form.trade = nextTrade || form.trade;
  }
);

const toggleEditing = () => {
  editing.value = !editing.value;
  if (!editing.value) {
    Object.assign(form, store.businessInfo);
  }
};

const handleSave = () => {
  store.updateBusinessInfo({ ...form });
  store.setTrade(form.trade);
  editing.value = false;
  router.push("/onboarding/line-items");
};

const handleLooksGood = () => {
  router.push("/onboarding/line-items");
};
</script>
