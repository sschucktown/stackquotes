<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-200">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
        <h1 class="text-2xl font-semibold text-slate-900">Contractor Profile</h1>
        <p class="mt-1 text-sm text-slate-600">
          Keep these details up to date and we&apos;ll automatically brand SmartProposals and QuoteIQ analytics for your business.
        </p>
      </header>

      <section
        v-if="profileStore.isDemo"
        class="rounded-3xl border border-slate-200 bg-blue-50/80 p-5 text-sm text-slate-700 shadow-sm transition-all duration-200"
      >
        <p class="font-semibold text-slate-900">Demo data enabled</p>
        <p class="mt-1 text-slate-600">
          We&apos;ve pre-filled your profile so you can see how proposals and analytics will look. Update any field and click Save to make it yours.
        </p>
      </section>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]">
        <aside class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A7D99] via-slate-800 to-slate-900 p-6 text-white shadow-xl transition-all duration-200">
          <div class="flex flex-col items-center gap-6 text-center">
            <div class="relative">
              <div class="h-28 w-28 overflow-hidden rounded-full border-4 border-white/30 bg-white/10 shadow-lg">
                <img
                  v-if="form.logoUrl"
                  :src="form.logoUrl"
                  alt="Company logo"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-lg font-semibold uppercase">
                  {{ initials }}
                </div>
              </div>
              <button
                type="button"
                class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs font-semibold uppercase tracking-wide text-white opacity-0 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                @click="triggerLogoPicker"
              >
                Change
              </button>
              <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="handleLogoChange" />
            </div>
            <div>
              <p class="text-lg font-semibold">{{ form.businessName || "Your Business Name" }}</p>
              <p class="text-sm text-slate-200">{{ displayLocation }}</p>
              <p class="mt-3 text-xs uppercase tracking-wide text-slate-300">Owner</p>
              <p class="text-sm text-white/90">{{ form.ownerName || "Add owner name" }}</p>
            </div>
          </div>

          <dl class="mt-8 space-y-3 text-left text-sm text-white/80">
            <div class="flex items-center justify-between">
              <dt class="text-slate-200">Trade</dt>
              <dd class="font-medium text-white">{{ form.tradeType || "Add trade type" }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-200">Phone</dt>
              <dd class="font-medium text-white">{{ form.phone || "Add phone" }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-200">Email</dt>
              <dd class="font-medium text-white">{{ form.email || "Add email" }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-200">Last updated</dt>
              <dd class="font-medium text-white">{{ lastUpdatedLabel }}</dd>
            </div>
          </dl>
        </aside>

        <section class="relative rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-200">
          <form class="grid gap-5 md:grid-cols-2" @submit.prevent="handleSave">
            <SQInput v-model="form.businessName" label="Business Name" placeholder="StackQuotes LLC" required />
            <SQInput v-model="form.ownerName" label="Owner Name" placeholder="Sam Builder" />

            <SQInput v-model="form.tradeType" label="Trade Type" placeholder="Decks & Outdoor Living" />
            <div class="grid grid-cols-2 gap-3">
              <SQInput v-model="form.city" label="City" placeholder="Charleston" />
              <SQInput v-model="form.state" label="State" placeholder="SC" maxlength="2" />
            </div>

            <SQInput v-model="form.phone" label="Phone" placeholder="(843) 555-1024" />
            <SQInput v-model="form.email" type="email" label="Email" placeholder="you@company.com" />

            <div class="md:col-span-2 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div>
                <p class="font-medium text-slate-800">Logo</p>
                <p class="text-xs text-slate-500">Use a square PNG or SVG for best results.</p>
              </div>
              <div class="flex items-center gap-3">
                <span v-if="profileStore.uploading" class="text-xs text-slate-500">Uploading...</span>
                <SQButton
                  type="button"
                  variant="secondary"
                  class="rounded-full px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
                  :disabled="profileStore.uploading"
                  @click="triggerLogoPicker"
                >
                  Upload Logo
                </SQButton>
              </div>
            </div>

            <div class="md:col-span-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              We&apos;ll use this profile to brand SmartProposals, analytics exports, and shared client links.
            </div>

            <div class="md:col-span-2"></div>

            <div
              class="sticky bottom-4 mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-inner"
            >
              <div class="flex items-center gap-2 text-xs">
                <span
                  v-if="saveState === 'saving'"
                  class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2 py-1 font-medium text-amber-600"
                >
                  <span class="flex h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Saving…
                </span>
                <span
                  v-else-if="saveState === 'saved'"
                  class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-600"
                >
                  <span class="h-2 w-2 rounded-full bg-emerald-500" /> Saved ✓
                </span>
                <span v-else class="text-slate-500">Changes autosave after you press Save.</span>
              </div>
              <SQButton
                type="submit"
                class="rounded-full !bg-[#3A7D99] !px-5 !py-2 !text-white transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#4f8faa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
                :loading="profileStore.saving"
              >
                Save Profile
              </SQButton>
            </div>
          </form>

          <footer class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500">
            <span>Need dark mode? Toggle below.</span>
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
              @click="toggleDarkMode"
            >
              <component :is="isDarkMode ? Sun : Moon" class="h-4 w-4" />
              {{ isDarkMode ? "Disable" : "Enable" }} dark mode
            </button>
          </footer>

          <transition name="fade">
            <p v-if="profileStore.error" class="mt-3 text-sm text-rose-600">{{ profileStore.error }}</p>
          </transition>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch } from "vue";
import { format } from "date-fns";
import SQInput from "@stackquotes/ui/components/SQInput.vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";
import { Moon, Sun } from "lucide-vue-next";

const profileStore = useContractorProfileStore();
const logoInput = ref<HTMLInputElement | null>(null);
const form = reactive({
  businessName: "",
  ownerName: "",
  tradeType: "",
  city: "",
  state: "",
  phone: "",
  email: "",
  logoUrl: "",
  publicSlug: "",
});

const saveState = ref<"idle" | "saving" | "saved">("idle");
let saveStateTimer: ReturnType<typeof setTimeout> | null = null;
const isDarkMode = ref(false);
const linkCopied = ref(false);
const origin = typeof window !== "undefined" ? window.location.origin : "https://stackquotes.com";

const sanitizeSlugValue = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

const publicUrl = computed(() =>
  form.publicSlug ? `${origin.replace(/\/$/, "")}/share/profile/${form.publicSlug}` : null
);

const setSavedState = (state: "idle" | "saving" | "saved") => {
  saveState.value = state;
  if (saveStateTimer) clearTimeout(saveStateTimer);
  if (state === "saved") {
    saveStateTimer = setTimeout(() => {
      saveState.value = "idle";
    }, 3000);
  }
};

onMounted(() => {
  void profileStore.load();
  isDarkMode.value = document.documentElement.classList.contains("dark");
});

onBeforeUnmount(() => {
  if (saveStateTimer) clearTimeout(saveStateTimer);
});

watch(
  () => profileStore.profile,
  (profile) => {
    form.businessName = profile?.businessName ?? "";
    form.ownerName = profile?.ownerName ?? "";
    form.tradeType = profile?.tradeType ?? "";
    form.city = profile?.city ?? "";
    form.state = profile?.state ?? "";
    form.phone = profile?.phone ?? "";
    form.email = profile?.email ?? "";
    form.logoUrl = profile?.logoUrl ?? "";
  },
  { immediate: true }
);

watch(
  () => profileStore.saving,
  (saving) => {
    if (saving) setSavedState("saving");
  }
);

const displayLocation = computed(() => {
  if (!form.city && !form.state) return "Add your service area";
  return [form.city, form.state].filter(Boolean).join(", ");
});

const initials = computed(() => {
  const name = form.businessName || "StackQuotes";
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
});

const lastUpdatedLabel = computed(() => {
  const updatedAt = profileStore.profile?.updatedAt ?? profileStore.profile?.createdAt;
  if (!updatedAt) return "Demo profile";
  try {
    return format(new Date(updatedAt), "MMM d, yyyy");
  } catch {
    return "Recently";
  }
});

const triggerLogoPicker = () => {
  logoInput.value?.click();
};

const handleLogoChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const [file] = input.files;
  try {
    setSavedState("saving");
    await profileStore.uploadLogo(file);
    setSavedState("saved");
  } catch (error) {
    console.error(error);
  } finally {
    if (input) input.value = "";
  }
};

const handleSave = async () => {
  try {
    setSavedState("saving");
    await profileStore.save({ ...form });
    setSavedState("saved");
  } catch (error) {
    console.error(error);
    setSavedState("idle");
  }
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle("dark", isDarkMode.value);
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

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
  }
}
</style>
