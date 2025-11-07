<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12">
    <div class="mx-auto w-full max-w-5xl">
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Loading contractor profile…
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600"
      >
        {{ error }}
      </div>

      <div v-else-if="profileData" class="space-y-8">
        <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div
            class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white md:p-10"
            :style="heroStyle"
          >
            <div class="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div class="flex items-start gap-4">
                <img
                  v-if="branding?.logoUrl"
                  :src="branding.logoUrl"
                  alt="Contractor logo"
                  class="h-20 w-20 rounded-2xl border border-white/20 object-cover shadow-lg md:h-28 md:w-28"
                />
                <div>
                  <p v-if="branding?.companyName" class="text-sm uppercase tracking-[0.3em] text-white/60">
                    {{ branding.companyName }}
                  </p>
                  <h1 class="mt-2 text-3xl font-semibold md:text-4xl">
                    {{ profileData.profile.businessName ?? "Trusted Contractor" }}
                  </h1>
                  <p v-if="profileData.profile.trade || profileData.profile.tradeType" class="mt-3 text-base text-white/80 md:text-lg">
                    {{ profileData.profile.trade ?? profileData.profile.tradeType }}
                  </p>
                  <p v-if="locationLabel" class="mt-1 text-sm text-white/60">
                    Serving {{ locationLabel }}
                  </p>
                </div>
              </div>
              <div class="w-full max-w-sm rounded-2xl border border-white/20 bg-white/5 p-4 md:w-auto md:p-6">
                <h2 class="text-xs font-semibold tracking-wide text-white/70">Let’s work together</h2>
                <ul class="mt-3 space-y-2 text-sm">
                  <li v-if="profileData.profile.email">
                    <a
                      class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white transition hover:bg-white/20"
                      :href="`mailto:${profileData.profile.email}`"
                    >
                      <span class="text-white/80">Email</span>
                      <span class="font-medium text-white">{{ profileData.profile.email }}</span>
                    </a>
                  </li>
                  <li v-if="profileData.profile.phone">
                    <a
                      class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white transition hover:bg-white/20"
                      :href="`tel:${profileData.profile.phone}`"
                    >
                      <span class="text-white/80">Call</span>
                      <span class="font-medium text-white">{{ profileData.profile.phone }}</span>
                    </a>
                  </li>
                  <li v-if="!profileData.profile.email && !profileData.profile.phone" class="text-white/70">
                    Contact details available upon request.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="p-6 md:p-10">
            <div class="grid gap-6 md:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ profileData.profile.ownerName ?? "Experienced Contractor" }}
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  Providing reliable service backed by SmartProposals.
                </p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Trade</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ profileData.profile.trade ?? profileData.profile.tradeType ?? "General Contracting" }}
                </p>
                <p class="mt-2 text-sm text-slate-600">Custom scopes designed for every project stage.</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Response Time</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">Same-day follow-up</p>
                <p class="mt-2 text-sm text-slate-600">Expect a personalized reply with tailored options.</p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="metrics" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h2 class="text-xl font-semibold text-slate-900">Performance Snapshot</h2>
          <p class="mt-2 text-sm text-slate-600">
            Transparent proposal insights powered by StackQuotes.
          </p>
          <div class="mt-6 grid gap-4 md:grid-cols-4">
            <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Total Proposals</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ metrics.totalProposals }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Accepted</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ metrics.acceptedProposals }}
              </p>
              <p class="text-sm text-slate-600">Approval rate {{ metrics.acceptanceRate }}%</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Average Value</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ currency(metrics.averageValue) }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Revenue YTD</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ currency(metrics.revenueYtd) }}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">Featured SmartProposals</h2>
              <p class="mt-1 text-sm text-slate-600">
                A glimpse at curated proposal options shared with clients.
              </p>
            </div>
            <span
              v-if="profileData.proposals.length"
              class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-slate-600"
              :style="badgeStyle"
            >
              Updated {{ lastProposalDate }}
            </span>
          </div>
          <div v-if="profileData.proposals.length" class="mt-6 grid gap-6 md:grid-cols-3">
            <article
              v-for="proposal in profileData.proposals"
              :key="proposal.id"
              class="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <header class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {{ proposal.quickquoteId ? proposal.quickquoteId.slice(0, 8).toUpperCase() : "SmartProposal" }}
                </span>
                <span
                  class="rounded-full border px-2 py-1 text-xs font-medium"
                  :style="badgeStyle"
                >
                  {{ proposal.status }}
                </span>
              </header>
              <p class="mt-4 text-2xl font-semibold text-slate-900">
                {{ currency(highestProposalValue(proposal)) }}
              </p>
              <p class="mt-1 text-sm text-slate-600">Top option total</p>
              <ul class="mt-4 space-y-2 text-sm text-slate-600">
                <li v-for="option in proposal.options.slice(0, 2)" :key="option.name">
                  <span class="font-medium text-slate-800">{{ option.name || "Proposal Option" }}</span>
                  — {{ option.summary ?? "Tailored scope with curated upgrades." }}
                </li>
              </ul>
              <footer class="mt-auto pt-4 text-xs uppercase tracking-wide text-slate-500">
                Generated {{ formatRelativeDate(proposal.createdAt) }}
              </footer>
            </article>
          </div>
          <div v-else class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center text-slate-600">
            SmartProposals will appear here as soon as new projects are shared.
          </div>
        </section>

        <footer
          v-if="branding?.footerText"
          class="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm"
        >
          {{ branding.footerText }}
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { fetchPublicContractorProfile } from "@modules/public/api/profile";
import type {
  PublicContractorProfilePayload,
  PublicContractorProfileProposal,
} from "@modules/public/api/profile";

const props = defineProps<{
  slug: string;
}>();

const loading = ref(true);
const error = ref("");
const profileData = ref<PublicContractorProfilePayload | null>(null);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const currency = (value: number | null | undefined) =>
  currencyFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);

const branding = computed(() => profileData.value?.branding ?? null);
const metrics = computed(() => profileData.value?.metrics ?? null);

const defaultAccent = "#1d4ed8";

const accentColor = computed(() => branding.value?.accentColor ?? defaultAccent);

const heroStyle = computed(() => ({
  background:
    branding.value?.accentColor && branding.value.accentColor.trim().length
      ? `linear-gradient(135deg, ${accentColor.value}, #0f172a)`
      : undefined,
}));

const badgeStyle = computed(() => ({
  backgroundColor: `${accentColor.value}15`,
  borderColor: `${accentColor.value}33`,
  color: accentColor.value,
}));

const locationLabel = computed(() => {
  const city = profileData.value?.profile.city?.trim();
  const state = profileData.value?.profile.state?.trim();
  if (city && state) {
    return `${city}, ${state}`;
  }
  return city ?? state ?? "";
});

const lastProposalDate = computed(() => {
  if (!profileData.value?.proposals.length) return "";
  const latest = [...profileData.value.proposals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  return formatRelativeDate(latest.createdAt);
});

const highestProposalValue = (proposal: PublicContractorProfileProposal) => {
  if (!proposal.totals.length) return 0;
  return proposal.totals.reduce((max, entry) => Math.max(max, entry.total ?? 0), 0);
};

const formatRelativeDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

async function loadData() {
  loading.value = true;
  error.value = "";
  profileData.value = null;
  try {
    const response = await fetchPublicContractorProfile(props.slug);
    if (response.error) {
      error.value = response.error;
      return;
    }
    if (!response.data) {
      error.value = "This contractor profile is not available.";
      return;
    }
    profileData.value = response.data;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Unexpected error loading this profile.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>
