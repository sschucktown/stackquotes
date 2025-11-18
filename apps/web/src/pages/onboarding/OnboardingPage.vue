<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-12">
    <div class="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center">
      <section class="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl backdrop-blur-xl">
        <header class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Welcome to StackQuotes</p>
          <h1 class="mt-3 text-2xl font-semibold text-slate-900">Just a couple quick details</h1>
          <p class="mt-1 text-sm text-slate-600">Tell us who you are and what you build.</p>
        </header>

        <form class="space-y-6" @submit.prevent="handleContinue">
          <SQInput v-model="fullName" label="Full Name" placeholder="Sam Builder" required />

          <SQSelect v-model="selectedTrade" label="Trade" placeholder="Select your trade" required>
            <option v-for="opt in TRADE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
          </SQSelect>

          <SQSelect v-model="selectedProjectSize" label="Average Project Size" placeholder="Select range" required>
            <option v-for="opt in SIZE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </SQSelect>

          <transition name="fade">
            <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
          </transition>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" class="text-sm text-slate-500 transition hover:text-slate-700" @click="handleSkip">Skip for now</button>
            <SQButton type="submit" class="w-full rounded-full !bg-[#3A7D99] !px-5 !py-2.5 !text-white shadow-lg transition hover:-translate-y-0.5 hover:!bg-[#4f8faa] sm:w-auto" :loading="submitting" :disabled="!canContinue || submitting">
              Continue
            </SQButton>
          </div>
        </form>
      </section>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import SQSelect from "@stackquotes/ui/components/SQSelect.vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import SQInput from "@stackquotes/ui/components/SQInput.vue";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";
import { useAuth } from "@/lib/auth";

const router = useRouter();
const profileStore = useContractorProfileStore();
const { clearStoredRedirect } = useAuth();

const ONBOARDING_SKIP_KEY = "stackquotes:onboarding:skip";
const ONBOARDING_DONE_KEY = "stackquotes:onboarding:done";
const setOnboardingFlag = (key: string, value: boolean) => {
  if (typeof window === "undefined") return;
  const storages: (Storage | null)[] = [
    window.localStorage ?? null,
    window.sessionStorage ?? null,
  ];
  storages.forEach((storage) => {
    if (!storage) return;
    try {
      if (value) {
        storage.setItem(key, "1");
      } else {
        storage.removeItem(key);
      }
    } catch {
      // ignore storage errors
    }
  });
};

const TRADE_OPTIONS = [
  "Decks & Porches",
  "Fencing",
  "Roofing",
  "Siding",
  "Pools & Spas",
  "Landscaping",
  "Painting",
  "Electrical",
  "Plumbing",
  "HVAC",
];

const SIZE_OPTIONS = [
  { label: "< $5K", value: "< $5K" },
  { label: "$5-15K", value: "$5-15K" },
  { label: "$15-50K", value: "$15-50K" },
  { label: "$50K+", value: "$50K+" },
];

const fullName = ref("");
const selectedTrade = ref<string>("");
const selectedProjectSize = ref<string>("");
const submitting = ref(false);
const error = ref("");

const canContinue = computed(() => Boolean(fullName.value && selectedTrade.value && selectedProjectSize.value));

onMounted(async () => {
  if (!profileStore.profile && !profileStore.loading) {
    try {
      await profileStore.load();
    } catch (err) {
      console.error(err);
    }
  }
  const profile = profileStore.profile;
  if (profile) {
    fullName.value = profile.ownerName ?? fullName.value;
    selectedTrade.value = profile.trade ?? profile.tradeType ?? selectedTrade.value;
    selectedProjectSize.value = profile.averageProjectSize ?? selectedProjectSize.value;
  }
});

const handleSkip = async () => {
  setOnboardingFlag(ONBOARDING_SKIP_KEY, true);
  await router.push({ name: "dashboard-home" });
};

const handleContinue = async () => {
  if (!canContinue.value) return;
  submitting.value = true;
  error.value = "";
  try {
    await profileStore.save({
      ownerName: fullName.value,
      trade: selectedTrade.value,
      tradeType: selectedTrade.value,
      averageProjectSize: selectedProjectSize.value,
    });
    await profileStore.load(true);
    clearStoredRedirect();
    setOnboardingFlag(ONBOARDING_DONE_KEY, true);
    setOnboardingFlag(ONBOARDING_SKIP_KEY, false);
    await router.push({ name: "dashboard-home" });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unable to save your onboarding details.";
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
