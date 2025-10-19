<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold text-slate-900">Contractor Profile</h1>
      <p class="text-sm text-slate-500">
        Keep these details up to date and we&apos;ll automatically brand SmartProposals and QuoteIQ analytics for your business.
      </p>
    </header>

    <section
      v-if="profileStore.isDemo"
      class="rounded-xl border border-slate-200 bg-sky-50 p-4 text-sm text-slate-700 shadow-sm"
    >
      <p class="font-medium text-slate-900">Demo data enabled</p>
      <p class="mt-1 text-slate-600">
        We&apos;ve pre-filled your profile so you can see how proposals and analytics will look. Update any field and click
        Save to make it yours.
      </p>
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img
              v-if="form.logoUrl"
              :src="form.logoUrl"
              alt="Company logo"
              class="h-full w-full object-contain"
            />
            <span v-else class="text-sm font-semibold uppercase text-slate-500">
              {{ initials }}
            </span>
            <button
              class="absolute bottom-1 right-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-xs text-slate-600 shadow-sm hover:text-sq-primary"
              type="button"
              @click="triggerLogoPicker"
            >
              Change
            </button>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleLogoChange"
            />
          </div>
          <div>
            <p class="text-lg font-semibold text-slate-900">{{ form.businessName || "Your Business Name" }}</p>
            <p class="text-sm text-slate-500">{{ displayLocation }}</p>
            <p class="mt-2 text-xs uppercase tracking-wide text-slate-400">Last updated</p>
            <p class="text-sm text-slate-600">{{ lastUpdatedLabel }}</p>
          </div>
        </div>
        <div class="mt-6 space-y-2 text-sm text-slate-600">
          <p class="flex items-center justify-between">
            <span class="font-medium text-slate-700">Owner</span>
            <span>{{ form.ownerName || "Add owner name" }}</span>
          </p>
          <p class="flex items-center justify-between">
            <span class="font-medium text-slate-700">Trade</span>
            <span>{{ form.tradeType || "Add trade type" }}</span>
          </p>
          <p class="flex items-center justify-between">
            <span class="font-medium text-slate-700">Phone</span>
            <span>{{ form.phone || "Add phone number" }}</span>
          </p>
          <p class="flex items-center justify-between">
            <span class="font-medium text-slate-700">Email</span>
            <span>{{ form.email || "Add email" }}</span>
          </p>
        </div>
      </aside>

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSave">
          <SQInput v-model="form.businessName" label="Business Name" placeholder="StackQuotes LLC" required />
          <SQInput v-model="form.ownerName" label="Owner Name" placeholder="Sam Builder" />

          <SQInput v-model="form.tradeType" label="Trade Type" placeholder="Decks & Outdoor Living" />
          <div class="grid grid-cols-2 gap-3">
            <SQInput v-model="form.city" label="City" placeholder="Charleston" />
            <SQInput v-model="form.state" label="State" placeholder="SC" maxlength="2" />
          </div>

          <SQInput v-model="form.phone" label="Phone" placeholder="(843) 555-1024" />
          <SQInput v-model="form.email" type="email" label="Email" placeholder="you@company.com" />

          <div class="md:col-span-2 mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div>
              <p class="font-medium text-slate-800">Logo</p>
              <p class="text-xs text-slate-500">Use a square PNG or SVG for best results.</p>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="profileStore.uploading" class="text-xs text-slate-500">Uploading...</span>
              <SQButton type="button" variant="secondary" :disabled="profileStore.uploading" @click="triggerLogoPicker">
                Upload Logo
              </SQButton>
            </div>
          </div>

          <div class="md:col-span-2 flex items-center justify-between pt-2">
            <p class="text-xs text-slate-500">
              We&apos;ll use this profile to brand SmartProposals, analytics exports, and shared client links.
            </p>
            <div class="flex items-center gap-2">
              <span v-if="successMessage" class="text-xs font-medium text-emerald-600">{{ successMessage }}</span>
              <SQButton type="submit" :loading="profileStore.saving">Save Profile</SQButton>
            </div>
          </div>
        </form>
        <p v-if="profileStore.error" class="mt-3 text-sm text-rose-600">{{ profileStore.error }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { format } from "date-fns";
import SQInput from "@stackquotes/ui/components/SQInput.vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";

const profileStore = useContractorProfileStore();
const logoInput = ref<HTMLInputElement | null>(null);
const successMessage = ref("");

const form = reactive({
  businessName: "",
  ownerName: "",
  tradeType: "",
  city: "",
  state: "",
  phone: "",
  email: "",
  logoUrl: "",
});

onMounted(() => {
  void profileStore.load();
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
    await profileStore.uploadLogo(file);
    successMessage.value = "Logo updated.";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (error) {
    console.error(error);
  } finally {
    if (input) {
      input.value = "";
    }
  }
};

const handleSave = async () => {
  try {
    await profileStore.save({ ...form });
    successMessage.value = "Profile saved.";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (error) {
    console.error(error);
  }
};
</script>
