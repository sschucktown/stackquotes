<script setup lang="ts">
// TODO: Replace mock data with Supabase project payload
// const { data: project } = await supabase...
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MotionFadeIn from "@/components/schedule/MotionFadeIn.vue";
import HeaderSection from "@/components/ClientDashboard/HeaderSection.vue";
import SelectionCard from "@/components/ClientDashboard/SelectionCard.vue";
import ScheduleCard from "@/components/ClientDashboard/ScheduleCard.vue";
import ChecklistCard from "@/components/ClientDashboard/ChecklistCard.vue";
import ContractPacketCard from "@/components/ClientDashboard/ContractPacketCard.vue";

type ChecklistItem = {
  label: string;
  complete: boolean;
};

type DashboardPayload = {
  project?: { name?: string; location?: string };
  option?: string;
  price?: number;
  deposit?: number;
  proposedDate?: string;
  confirmedDate?: string | null;
  checklist?: ChecklistItem[];
};

const route = useRoute();
const router = useRouter();

const fallbackData = {
  project: { name: "Maple St Deck", location: "Seattle, WA" },
  option: "Better",
  price: 23800,
  deposit: 3570,
  proposedDate: "2025-12-12",
  confirmedDate: null as string | null,
  checklist: [
    { label: "Confirm yard and gate access for crew", complete: false },
    { label: "Mark sprinklers, buried lines, or obstacles", complete: false },
    { label: "Plan parking or material staging area", complete: false },
    { label: "Give neighbors a heads up", complete: false },
    { label: "Plan for kids & pets on build days", complete: false },
  ],
};

const parsePayload = computed<DashboardPayload | null>(() => {
  const raw = route.query.payload;
  if (!raw) return null;
  try {
    const decoded = Array.isArray(raw) ? raw[0] : String(raw);
    const parsed = JSON.parse(decodeURIComponent(decoded));
    return (parsed?.dashboard as DashboardPayload) || parsed;
  } catch (error) {
    console.warn("[ClientDashboard] invalid payload", error);
    return null;
  }
});

const data = computed(() => ({
  project: {
    ...fallbackData.project,
    ...(parsePayload.value?.project || {}),
  },
  option: parsePayload.value?.option ?? fallbackData.option,
  price: parsePayload.value?.price ?? fallbackData.price,
  deposit: parsePayload.value?.deposit ?? fallbackData.deposit,
  proposedDate: parsePayload.value?.proposedDate ?? fallbackData.proposedDate,
  confirmedDate: parsePayload.value?.confirmedDate ?? fallbackData.confirmedDate,
  checklist: parsePayload.value?.checklist ?? fallbackData.checklist,
}));

const scheduleConfirmed = computed(() => Boolean(data.value.confirmedDate));

const formatDate = (value: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formattedStartDate = computed(() => formatDate(data.value.confirmedDate || data.value.proposedDate));

const withPayload = (path: string) => {
  const query = route.query.payload ? { payload: route.query.payload } : undefined;
  router.push({ path, query });
};

const handleViewProposal = () => withPayload("/prototype/smartproposal/client");
const handleViewApproval = () => withPayload("/prototype/smartproposal/signed");
const handleConfirmSchedule = () => withPayload("/prototype/client/schedule/confirmed");
const handleRequestChange = () => withPayload("/prototype/client/schedule/requested-change");
const handleAddToCalendar = () => withPayload("/prototype/client/schedule/confirmed");
const handleOpenChecklist = () => withPayload("/prototype/client/pre-construction");
const handleOpenContractPacket = () => withPayload("/prototype/client/contract-packet");
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-[640px] flex-col px-4 py-8 sm:py-12">
      <MotionFadeIn>
        <HeaderSection
          :project-name="data.project.name"
          :project-location="data.project.location"
          :confirmed="scheduleConfirmed"
        />
      </MotionFadeIn>

      <MotionFadeIn>
        <div class="mt-3 mb-6 flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-xs font-semibold text-slate-700">Proposal approved</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span class="text-xs font-semibold text-slate-700">Schedule pending</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
            <span class="text-xs font-semibold text-slate-500">Kickoff pending</span>
          </div>
        </div>
      </MotionFadeIn>

      <div class="mt-6 space-y-4">
        <MotionFadeIn>
          <SelectionCard
            :option-label="data.option"
            :price="data.price"
            @view-proposal="handleViewProposal"
            @view-approval="handleViewApproval"
          />
        </MotionFadeIn>

        <MotionFadeIn>
          <ScheduleCard
            :proposed-date="data.proposedDate"
            :confirmed-date="data.confirmedDate"
            @confirm="handleConfirmSchedule"
            @request-change="handleRequestChange"
            @add-to-calendar="handleAddToCalendar"
          />
        </MotionFadeIn>

        <MotionFadeIn>
          <ChecklistCard
            :items="data.checklist"
            @open="handleOpenChecklist"
          />
        </MotionFadeIn>

        <MotionFadeIn>
          <ContractPacketCard
            :price="data.price"
            :deposit="data.deposit"
            :start-date="formattedStartDate"
            @download="handleOpenContractPacket"
          />
        </MotionFadeIn>
      </div>
    </div>
  </main>
</template>
