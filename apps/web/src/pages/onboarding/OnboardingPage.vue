<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-12">
    <div class="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center">
      <section
        class="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300"
      >
        <header class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Welcome to StackQuotes
          </p>
          <h1 class="mt-4 text-3xl font-semibold text-slate-900">Let’s tailor your workspace</h1>
          <p class="mt-2 text-sm text-slate-600">
            We’ll use your trade to preload popular projects and SmartProposals so you can dive right in.
          </p>
        </header>

        <form class="space-y-8" @submit.prevent="handleContinue">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Step 1
            </p>
            <h2 class="mt-2 text-xl font-semibold text-slate-900">
              What's your average project size?
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              Choose the option that aligns with most of your projects.
            </p>
            <div class="mt-4">
              <SQSelect
                v-model="selectedTrade"
                label="Primary trade"
                placeholder="Select your trade"
                required
              >
                <option
                  v-for="option in tradeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </SQSelect>
            </div>
          </div>

          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Step 2
            </p>
            <h2 class="mt-2 text-xl font-semibold text-slate-900">
              What's your average project size?
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              This helps us calibrate your starter pricing and proposal templates.
            </p>
            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <label
                v-for="size in projectSizeOptions"
                :key="size.value"
                class="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <input
                  v-model="selectedProjectSize"
                  class="h-4 w-4 text-sq-primary focus:ring-sq-primary"
                  type="radio"
                  name="project-size"
                  :value="size.value"
                />
                <span class="font-medium text-slate-900">{{ size.label }}</span>
              </label>
            </div>
          </div>

          <transition name="fade">
            <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {{ error }}
            </p>
          </transition>

          <div class="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              class="text-slate-500 transition hover:text-slate-700"
              @click="handleSkip"
            >
              Skip for now
            </button>
            <SQButton
              type="submit"
              class="w-full rounded-full !bg-[#3A7D99] !px-5 !py-2.5 !text-white shadow-lg transition hover:-translate-y-0.5 hover:!bg-[#4f8faa] sm:w-auto"
              :loading="submitting"
              :disabled="!canContinue || submitting"
            >
              Continue
            </SQButton>
          </div>
        </form>

        <transition name="fade">
          <div
            v-if="seeding"
            class="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div class="flex flex-col items-center gap-3 text-center">
              <span class="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#3A7D99]" />
              <p class="text-base font-semibold text-slate-900">Loading your starter projects...</p>
              <p class="text-sm text-slate-500">We're tailoring proposals and pricing for {{ selectedTrade }} pros.</p>
            </div>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import SQSelect from "@stackquotes/ui/components/SQSelect.vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";
import { useAuth } from "@/lib/auth";

const router = useRouter();
const profileStore = useContractorProfileStore();
const { clearStoredRedirect } = useAuth();

const tradeOptions = [
  "Plumber",
  "Electrician",
  "HVAC",
  "Deck Builder",
  "Roofer",
  "Pool Contractor",
  "Landscaper",
  "Kitchen Remodeler",
  "Bathroom Remodeler",
  "General Remodeler",
  "Solar Installer",
  "Garage Builder",
].map((label) => ({ label, value: label }));

const projectSizeOptions = [
  { label: "< $5K", value: "< $5K" },
  { label: "$5-15K", value: "$5-15K" },
  { label: "$15-50K", value: "$15-50K" },
  { label: "$50K+", value: "$50K+" },
];

const selectedTrade = ref<string>("");
const selectedProjectSize = ref<string>("");
const submitting = ref(false);
const seeding = ref(false);
const error = ref("");
let redirectTimer: ReturnType<typeof setTimeout> | null = null;

const canContinue = computed(() => Boolean(selectedTrade.value) && Boolean(selectedProjectSize.value));

const hydrateFromProfile = () => {
  const profile = profileStore.profile;
  if (!profile) return;
  selectedTrade.value = profile.trade ?? profile.tradeType ?? selectedTrade.value;
  selectedProjectSize.value = profile.averageProjectSize ?? selectedProjectSize.value;
};

onMounted(async () => {
  if (!profileStore.profile && !profileStore.loading) {
    try {
      await profileStore.load();
    } catch (err) {
      console.error(err);
    }
  }
  hydrateFromProfile();
});

watch(
  () => profileStore.profile,
  () => {
    hydrateFromProfile();
  }
);

onBeforeUnmount(() => {
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
});

const handleSkip = async () => {
  await router.push({ name: "dashboard-home" });
};

const handleContinue = async () => {
  if (!canContinue.value) return;
  submitting.value = true;
  error.value = "";
  try {
    await profileStore.save({
      trade: selectedTrade.value,
      tradeType: selectedTrade.value,
      averageProjectSize: selectedProjectSize.value,
    });
    await profileStore.load(true);
    clearStoredRedirect();
    seeding.value = true;
    submitting.value = false;
    redirectTimer = setTimeout(async () => {
      await router.push({ name: "dashboard-home" });
    }, 1600);
  } catch (err) {
    submitting.value = false;
    error.value = err instanceof Error ? err.message : "Unable to save your onboarding details.";
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
