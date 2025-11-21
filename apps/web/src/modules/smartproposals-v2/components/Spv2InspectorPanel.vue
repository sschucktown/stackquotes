<template>
  <aside class="flex h-full flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-slate-500">Inspector</p>
        <h2 class="text-lg font-semibold text-slate-900">{{ panelTitle }}</h2>
      </div>
      <button type="button" class="text-xs text-slate-500 underline" @click="store.resetToDefaults">
        Reset mock
      </button>
    </header>

    <div class="flex-1 overflow-y-auto pr-1">
      <div v-if="isBrandingView" class="space-y-5">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary color</label>
          <div class="mt-2 flex items-center gap-3">
            <input
              type="color"
              class="h-10 w-14 rounded-lg border border-slate-200"
              :value="brand.primaryColor"
              @input="updateBrandColor('primaryColor', $event)"
            />
            <input
              class="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              :value="brand.primaryColor"
              @input="updateBrandText('primaryColor', $event)"
            />
          </div>
          <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span>Presets:</span>
            <button
              v-for="color in primaryPresets"
              :key="color"
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1"
              @click="store.updateBrand({ primaryColor: color })"
            >
              <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: color }" />
              {{ color }}
            </button>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Accent color</label>
          <div class="mt-2 flex items-center gap-3">
            <input
              type="color"
              class="h-10 w-14 rounded-lg border border-slate-200"
              :value="brand.accentColor"
              @input="updateBrandColor('accentColor', $event)"
            />
            <input
              class="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              :value="brand.accentColor"
              @input="updateBrandText('accentColor', $event)"
            />
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Font preset</label>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <button
              v-for="preset in fontPresets"
              :key="preset.value"
              type="button"
              class="rounded-2xl border px-3 py-2 text-sm font-medium transition"
              :class="brand.fontPreset === preset.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'"
              @click="store.updateBrand({ fontPreset: preset.value })"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Logo</label>
          <div class="mt-2 flex flex-col gap-2 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="text-xs"
              @change="handleLogoUpload"
            />
            <p v-if="brand.logoDataUrl" class="text-xs">Current logo preview:</p>
            <div v-if="brand.logoDataUrl" class="flex items-center gap-3">
              <img :src="brand.logoDataUrl" alt="Logo preview" class="h-14 w-14 rounded-xl border border-slate-200 object-contain" />
              <button type="button" class="text-xs text-rose-500" @click="removeLogo">Remove</button>
            </div>
            <p class="text-xs text-slate-500">Files never leave your browser in this sandbox.</p>
          </div>
        </div>
      </div>

      <div v-else-if="selectedSection?.type === 'hero'" class="space-y-4">
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Hero title</span>
          <input
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.hero.title"
            @input="updateHero('title', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtitle</span>
          <textarea
            rows="3"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.hero.subtitle"
            @input="updateHero('subtitle', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Project address</span>
          <input
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.hero.projectAddress"
            @input="updateHero('projectAddress', $event)"
          />
        </label>
      </div>

      <div v-else-if="selectedSection?.type === 'packages'" class="space-y-6">
        <div
          v-for="pkg in packageEntries"
          :key="pkg.key"
          class="rounded-2xl border border-slate-200 p-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-900">{{ pkg.data.label }}</h3>
            <input
              type="number"
              min="0"
              class="w-32 rounded-xl border border-slate-200 px-2 py-1 text-sm text-right"
              :value="pkg.data.price"
              @input="updatePackageField(pkg.key, 'price', $event)"
            />
          </div>
          <label class="mt-3 block text-xs uppercase tracking-wide text-slate-500">Summary</label>
          <textarea
            rows="2"
            class="mt-1 w-full rounded-xl border border-slate-200 px-2 py-1 text-sm"
            :value="pkg.data.summary"
            @input="updatePackageField(pkg.key, 'summary', $event)"
          />
          <label class="mt-3 block text-xs uppercase tracking-wide text-slate-500">Bullets</label>
          <div class="mt-1 flex flex-col gap-2">
            <div
              v-for="(bullet, index) in pkg.data.bullets"
              :key="index"
              class="flex items-center gap-2"
            >
              <input
                class="flex-1 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                :value="bullet"
                @input="updateBullet(pkg.key, index, $event)"
              />
              <button
                type="button"
                class="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500"
                @click="removeBullet(pkg.key, index)"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              class="text-xs font-semibold text-slate-700"
              @click="addBullet(pkg.key)"
            >
              + Add bullet
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="selectedSection?.type === 'why-us'" class="space-y-3">
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Why choose us copy</span>
          <textarea
            rows="6"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.whyUsText"
            @input="store.updateWhyUsText(($event.target as HTMLTextAreaElement).value)"
          />
        </label>
      </div>

      <div v-else-if="selectedSection?.type === 'payment'" class="space-y-4">
        <div class="flex gap-2">
          <button
            v-for="option in depositOptions"
            :key="option.value"
            type="button"
            class="flex-1 rounded-2xl border px-3 py-2 text-sm font-medium transition"
            :class="store.paymentTerms.depositType === option.value
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 text-slate-700'"
            @click="store.updatePaymentTerms({ depositType: option.value })"
          >
            {{ option.label }}
          </button>
        </div>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit value</span>
          <input
            type="number"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.paymentTerms.depositValue"
            @input="updatePaymentValue"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</span>
          <textarea
            rows="4"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.paymentTerms.notes"
            @input="store.updatePaymentTerms({ notes: ($event.target as HTMLTextAreaElement).value })"
          />
        </label>
      </div>

      <div v-else-if="selectedSection?.type === 'footer'" class="space-y-4">
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Company name</span>
          <input
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.companyFooter.companyName"
            @input="updateFooter('companyName', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">License number</span>
          <input
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.companyFooter.license"
            @input="updateFooter('license', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</span>
          <input
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.companyFooter.phone"
            @input="updateFooter('phone', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
          <input
            type="email"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.companyFooter.email"
            @input="updateFooter('email', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</span>
          <textarea
            rows="3"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            :value="store.companyFooter.address"
            @input="store.updateCompanyFooter({ address: ($event.target as HTMLTextAreaElement).value })"
          />
        </label>
      </div>

      <div v-else class="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        Select a section to edit its content.
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSpv2Store } from "../stores/useSpv2Store";
import type { Spv2State } from "../stores/useSpv2Store";

type PackageKey = keyof Spv2State["packages"];

const props = defineProps<{ selectedSectionId: string | null }>();
const store = useSpv2Store();
const selectedSection = computed(() =>
  store.sections.find((section) => section.id === props.selectedSectionId) ?? null
);
const isBrandingView = computed(() => props.selectedSectionId === "branding");

const panelTitle = computed(() => {
  if (isBrandingView.value) return "Branding & theme";
  if (selectedSection.value) return `${selectedSection.value.title ?? ""} settings`.trim();
  return "Nothing selected";
});

const brand = computed(() => store.brand);

const primaryPresets = ["#0F62FE", "#0F766E", "#7C3AED", "#F97316", "#0F172A"];
const fontPresets = [
  { value: "clean", label: "Clean" },
  { value: "friendly", label: "Friendly" },
  { value: "bold", label: "Bold" },
] as const;

const depositOptions = [
  { value: "percent", label: "Percent" },
  { value: "fixed", label: "Fixed $" },
] as const;

const packageEntries = computed(() => [
  { key: "good" as PackageKey, data: store.packages.good },
  { key: "better" as PackageKey, data: store.packages.better },
  { key: "best" as PackageKey, data: store.packages.best },
]);

const updateBrandColor = (key: "primaryColor" | "accentColor", event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  store.updateBrand({ [key]: value });
};

const updateBrandText = (key: "primaryColor" | "accentColor", event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  if (value.startsWith("#") && (value.length === 4 || value.length === 7)) {
    store.updateBrand({ [key]: value });
  }
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    const dataUrl = await readFileAsDataUrl(file);
    store.updateBrand({ logoDataUrl: dataUrl });
  } finally {
    target.value = "";
  }
};

const removeLogo = () => store.updateBrand({ logoDataUrl: null });

const updateHero = (key: "title" | "subtitle" | "projectAddress", event: Event) => {
  const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  store.updateHero({ [key]: value });
};

const updatePackageField = (
  key: PackageKey,
  field: "price" | "summary",
  event: Event
) => {
  const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  if (field === "price") {
    store.updatePackage(key, { price: Number(value) });
  } else {
    store.updatePackage(key, { summary: value });
  }
};

const updateBullet = (key: PackageKey, index: number, event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  const bullets = [...store.packages[key].bullets];
  bullets[index] = value;
  store.replacePackageBullets(key, bullets);
};

const addBullet = (key: PackageKey) => {
  const bullets = [...store.packages[key].bullets, "New benefit"];
  store.replacePackageBullets(key, bullets);
};

const removeBullet = (key: PackageKey, index: number) => {
  const bullets = store.packages[key].bullets.filter((_, idx) => idx !== index);
  store.replacePackageBullets(key, bullets);
};

const updatePaymentValue = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  store.updatePaymentTerms({ depositValue: value });
};

const updateFooter = (key: "companyName" | "license" | "phone" | "email", event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  store.updateCompanyFooter({ [key]: value });
};
</script>
