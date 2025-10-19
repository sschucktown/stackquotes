<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">QuickQuote</p>
          <h1 class="text-2xl font-semibold text-slate-900">Estimate Workspace</h1>
          <p class="text-sm text-slate-600">Create, refine, and send polished estimates in seconds.</p>
        </div>
        <div class="flex items-center gap-3">
          <SQButton
            variant="ghost"
            size="sm"
            class="rounded-full border border-slate-200 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
            @click="toggleSettings"
          >
            Workspace Settings
          </SQButton>
          <SQButton
            size="sm"
            class="rounded-full !bg-[#3A7D99] !px-5 !py-2 !text-white transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#4f8faa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
            @click="createEstimate"
          >
            + New QuickQuote
          </SQButton>
          <SQButton
            variant="ghost"
            size="sm"
            class="rounded-full border border-transparent text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
            @click="signOut"
          >
            Sign out
          </SQButton>
        </div>
      </div>
    </header>

    <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start lg:px-6 xl:px-8">
      <section class="flex-1 space-y-6">
        <div class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all duration-200 ease-in-out">
          <EstimateList
            :estimates="filteredEstimates"
            :status="statusFilter"
            :search="searchTerm"
            :clients="clientStore.items"
            @update:status="setStatus"
            @update:search="setSearch"
            @select="openEstimate"
            @duplicate="duplicate"
          />
        </div>

        <Transition name="fade">
          <div
            v-if="showCommandHint"
            class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 shadow-sm transition-all duration-200"
          >
            Command palette coming soon. Press <kbd class="rounded bg-white px-1 py-0.5 text-xs font-semibold">/</kbd> to open once available.
          </div>
        </Transition>
      </section>

      <aside class="flex w-full flex-col gap-6 lg:w-80">
        <div class="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-200 ease-in-out">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Pipeline</h2>
              <p class="text-xs text-slate-500">Where every quote stands right now.</p>
            </div>
            <SQButton
              variant="ghost"
              size="sm"
              class="rounded-full border border-slate-200 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
              @click="openAnalytics"
            >
              View analytics
            </SQButton>
          </header>

          <div v-if="isLoading" class="space-y-3">
            <div v-for="n in 4" :key="`pipeline-skeleton-${n}`" class="h-16 rounded-xl bg-slate-100 animate-pulse" />
          </div>
          <TransitionGroup v-else name="fade-up" tag="ul" class="space-y-3">
            <li
              v-for="stage in pipeline"
              :key="stage.label"
              class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-within:ring-2 focus-within:ring-[#3A7D99]/40"
            >
              <button
                type="button"
                class="flex w-full items-start justify-between text-left focus:outline-none"
                @click="navigate(stage.route)"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ stage.label }}</p>
                  <p class="text-xs uppercase tracking-wide text-slate-500">{{ stage.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-slate-900">{{ stage.value.toLocaleString() }}</p>
                  <p v-if="stage.amount !== undefined" class="text-xs text-slate-500">{{ currency(stage.amount) }}</p>
                </div>
              </button>
              <div class="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div class="h-full rounded-full transition-all duration-300" :class="stage.barClass" :style="{ width: `${stage.progress}%` }" />
              </div>
              <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{{ stage.statusDetail }}</span>
                <span v-if="stage.amount !== undefined">{{ currency(stage.amount) }}</span>
              </div>
            </li>
          </TransitionGroup>
        </div>

        <div class="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-200 ease-in-out">
          <header class="mb-3 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Workspace</h2>
              <p class="text-xs text-slate-500">Update defaults and branding in one place.</p>
            </div>
            <SQButton
              variant="ghost"
              size="sm"
              class="rounded-full border border-slate-200 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A7D99]/60"
              @click="toggleSettings"
            >
              {{ goToSettings ? "Hide" : "Open" }}
            </SQButton>
          </header>

          <Transition name="fade">
            <SettingsForm v-if="goToSettings" />
          </Transition>
          <p v-if="!goToSettings" class="text-sm text-slate-600">
            Personalize your proposals, tax rates, and branding defaults. Press <kbd class="rounded bg-slate-100 px-1 py-0.5 text-xs">S</kbd>
            to toggle.
          </p>
        </div>
      </aside>
    </main>

    <PDFPreviewModal :open="!!estimateStore.activePdfUrl" :pdf-url="estimateStore.activePdfUrl" @close="estimateStore.activePdfUrl = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";
import EstimateList from "@modules/quickquote/components/EstimateList.vue";
import PDFPreviewModal from "@modules/quickquote/components/PDFPreviewModal.vue";
import SettingsForm from "@modules/quickquote/components/SettingsForm.vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import { useEstimateStore, type EstimatePipelineStatus } from "@modules/quickquote/stores/estimateStore";
import { useClientStore } from "@modules/quickquote/stores/clientStore";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";
import { STATUS_ORDER, statusLabel as statusLabelName } from "@modules/quickquote/utils/status";

const router = useRouter();
const estimateStore = useEstimateStore();
const clientStore = useClientStore();
const settingsStore = useSettingsStore();
const { signOut: supabaseSignOut } = useAuth();
const demoStore = useDemoStore();

const statusFilter = ref<EstimatePipelineStatus | undefined>(undefined);
const searchTerm = ref("");
const goToSettings = ref(false);
const showCommandHint = ref(false);
let commandHintTimer: ReturnType<typeof setTimeout> | null = null;

const isLoading = computed(() => estimateStore.loading || clientStore.loading || settingsStore.loading);

const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.toLowerCase() === "n") {
    event.preventDefault();
    createEstimate();
  }
  if (event.key === "/") {
    event.preventDefault();
    if (!showCommandHint.value) {
      showCommandHint.value = true;
      if (commandHintTimer) clearTimeout(commandHintTimer);
      commandHintTimer = setTimeout(() => {
        showCommandHint.value = false;
      }, 4000);
    }
  }
  if (event.key.toLowerCase() === "s") {
    event.preventDefault();
    toggleSettings();
  }
};

const toggleSettings = () => {
  goToSettings.value = !goToSettings.value;
};

onMounted(() => {
  estimateStore.load();
  clientStore.load();
  settingsStore.load();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (commandHintTimer) clearTimeout(commandHintTimer);
});

watch([statusFilter, searchTerm], ([status, search]) => {
  estimateStore.load({ status, search });
});

const filteredEstimates = computed(() => estimateStore.items);
const counts = computed(() => estimateStore.groupedByStatus);
const statusOrder = STATUS_ORDER;
const statusLabel = (status: EstimatePipelineStatus) => statusLabelName(status);
const statusDescriptionMap: Record<EstimatePipelineStatus, string> = {
  draft: "Quotes in progress",
  sent: "Awaiting response",
  seen: "Viewed by client",
  accepted: "Approved and ready",
  declined: "Needs follow-up",
};
const routeMap: Record<EstimatePipelineStatus, string> = {
  draft: "quickquote-dashboard",
  sent: "quickquote-dashboard",
  seen: "quickquote-dashboard",
  accepted: "smart-proposals",
  declined: "analytics",
};

const pipeline = computed(() => {
  const total = Math.max(estimateStore.items.length, 1);
  return statusOrder.map((status) => {
    const list = counts.value[status] ?? [];
    const progress = Math.min(100, Math.round((list.length / total) * 100));
    const amount = list.reduce((sum, estimate) => sum + estimate.total, 0);
    const barMap: Record<EstimatePipelineStatus, string> = {
      draft: "bg-slate-400",
      sent: "bg-blue-500",
      seen: "bg-blue-400",
      accepted: "bg-emerald-500",
      declined: "bg-rose-500",
    };
    const statusDetail = (() => {
      switch (status) {
        case "draft":
          return `${list.length} in draft`;
        case "sent":
          return `${list.length} sent`;
        case "seen":
          return `${list.length} viewed`;
        case "accepted":
          return `${list.length} wins`;
        case "declined":
          return `${list.length} lost`;
        default:
          return "";
      }
    })();
    return {
      label: statusLabel(status),
      description: statusDescriptionMap[status] ?? "",
      value: list.length,
      amount: list.length ? amount : undefined,
      progress,
      barClass: barMap[status] ?? "bg-slate-400",
      statusDetail,
      tooltip: `${list.length} ${status} quotes`,
      route: routeMap[status] ?? "quickquote-dashboard",
    };
  });
});

const setStatus = (status?: EstimatePipelineStatus) => {
  statusFilter.value = status;
};

const setSearch = (value: string) => {
  searchTerm.value = value;
};

const openEstimate = (id: string) => {
  router.push(`/quickquote/estimates/${id}`);
};

const createEstimate = () => {
  router.push("/quickquote/estimates/new");
};

const duplicate = async (id: string) => {
  await estimateStore.duplicate(id);
};

const openAnalytics = () => {
  router.push({ name: "analytics" });
};

const navigate = (routeName: string) => {
  router.push({ name: routeName });
};

const signOut = async () => {
  demoStore.deactivate();
  await supabaseSignOut();
  router.push("/login");
};

const currency = (value: number) => {
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return formatter.format(value || 0);
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

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.25s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: none !important;
  }
  .fade-up-enter-from,
  .fade-up-leave-to {
    transform: none !important;
  }
}
</style>
