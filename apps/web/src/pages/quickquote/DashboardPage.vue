<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">QuickQuote Dashboard</h1>
          <p class="text-sm text-slate-500">Create, send, and track professional estimates.</p>
        </div>
        <div class="flex items-center gap-3">
          <SQButton variant="ghost" size="sm" @click="goToSettings = !goToSettings">
            Settings
          </SQButton>
          <SQButton size="sm" @click="createEstimate">New Estimate</SQButton>
          <SQButton size="sm" variant="ghost" @click="signOut">Sign out</SQButton>
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[2fr_1fr]">
      <section class="space-y-4">
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
      </section>
      <aside class="space-y-6">
        <SQCard title="Pipeline" padded>
          <ul class="space-y-3 text-sm">
            <li
              v-for="status in statusOrder"
              :key="status"
              class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
            >
              <span
                :class="[
                  statusClass(status),
                  'rounded-full px-2 py-1 text-xs font-medium transition-colors',
                ]"
              >
                {{ statusLabel(status) }}
              </span>
              <span class="text-sm font-semibold text-slate-700">
                {{ counts[status]?.length ?? 0 }}
              </span>
            </li>
          </ul>
        </SQCard>
        <SQCard title="Settings" padded>
          <SettingsForm v-if="goToSettings" />
          <p v-else class="text-sm text-slate-500">Update company defaults and branding.</p>
        </SQCard>
      </aside>
    </main>

    <PDFPreviewModal
      :open="!!estimateStore.activePdfUrl"
      :pdf-url="estimateStore.activePdfUrl"
      @close="estimateStore.activePdfUrl = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";
import EstimateList from "@modules/quickquote/components/EstimateList.vue";
import PDFPreviewModal from "@modules/quickquote/components/PDFPreviewModal.vue";
import SettingsForm from "@modules/quickquote/components/SettingsForm.vue";
import { useEstimateStore, type EstimatePipelineStatus } from "@modules/quickquote/stores/estimateStore";
import { useClientStore } from "@modules/quickquote/stores/clientStore";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";
import { STATUS_ORDER, statusClass as statusClassName, statusLabel as statusLabelName } from "@modules/quickquote/utils/status";

const router = useRouter();
const estimateStore = useEstimateStore();
const clientStore = useClientStore();
const settingsStore = useSettingsStore();
const { signOut: supabaseSignOut } = useAuth();
const demoStore = useDemoStore();

const statusFilter = ref<EstimatePipelineStatus | undefined>(undefined);
const searchTerm = ref("");
const goToSettings = ref(false);

onMounted(() => {
  estimateStore.load();
  clientStore.load();
  settingsStore.load();
});

watch([statusFilter, searchTerm], ([status, search]) => {
  estimateStore.load({ status, search });
});

const filteredEstimates = computed(() => estimateStore.items);
const counts = computed(() => estimateStore.groupedByStatus);
const statusOrder = STATUS_ORDER;
const statusClass = (status: EstimatePipelineStatus) => statusClassName(status);
const statusLabel = (status: EstimatePipelineStatus) => statusLabelName(status);

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

const signOut = async () => {
  demoStore.deactivate();
  await supabaseSignOut();
  router.push("/login");
};
</script>
