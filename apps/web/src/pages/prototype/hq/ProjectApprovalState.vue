<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import SchedulingModal from "@/components/HQ/SchedulingModal.vue";
import { useSchedulingStore } from "@/stores/schedulingStore";
import { useMessageStore } from "@/stores/messageStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { useApprovalEventStore } from "@/stores/approvalEventStore";
import { useAlertStore } from "@/stores/alertStore";
import { useSchedulesStore } from "@/stores/schedulesStore";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";
import { useClientSchedulePrototype } from "@/stores/useClientSchedulePrototype";
import { useRouter } from "vue-router";

const schedulingStore = useSchedulingStore();
const messageStore = useMessageStore();
const timelineStore = useTimelineStore();
const approvalEventStore = useApprovalEventStore();
const alertStore = useAlertStore();
const schedulesStore = useSchedulesStore();
const hqStore = useContractorHQPrototype();
const clientScheduleStore = useClientSchedulePrototype();
const router = useRouter();

const schedulingOpen = ref(false);
const mode = ref<"approval" | "ready">("approval");

const project = {
  id: "job-maple",
  clientName: "Sarah Thompson",
  projectName: "Maple St Deck",
  price: 23800,
  depositDue: 3570,
};

const approvalEvent = {
  id: "approval-job-maple",
  optionLabel: "Better",
  price: 23800,
  depositDue: 3570,
};

approvalEventStore.upsertEvent({ ...approvalEvent, projectId: project.id, reviewed: false });

const latestSchedule = computed(() => schedulingStore.getByProject(project.id)[0]);

const readyJob = reactive({
  clientName: "Sarah Thompson",
  projectName: "Maple St Deck",
  optionLabel: "Better option",
  price: 23800,
  deposit: 3570,
  startDateLabel: "Friday, December 12, 2025",
  status: "ready" as const,
});

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function handleScheduleSubmit(payload: any) {
  const scheduled = schedulingStore.scheduleJob({
    ...payload,
    projectId: project.id,
    clientName: project.clientName,
    projectName: project.projectName,
  });

  schedulesStore.setSchedule(project.id, {
    startDate: scheduled.startDate,
    depositDue: scheduled.depositDue,
    notes: scheduled.notes || "",
    status: "proposed",
  });
  clientScheduleStore.setProposal({
    proposedDate: scheduled.startDate,
    depositDue: scheduled.depositDue,
    contractorMessage: scheduled.notes || "",
  });

  messageStore.addSystemMessage(project.id, {
    type: "schedule_proposed",
    body: `Proposed start date: ${scheduled.startDate}. Deposit due: ${formatCurrency(scheduled.depositDue)}.`,
  });

  timelineStore.addEvent(project.id, "Schedule proposed");
  timelineStore.addEvent(project.id, "Awaiting client confirmation");

  approvalEventStore.markReviewed(approvalEvent.id);

  alertStore.addAlert(`Schedule proposed for ${project.clientName} — awaiting client confirmation`, "info");
  hqStore.addScheduleProposal(project.id, project.projectName);

  schedulingOpen.value = false;
  router.push("/prototype/job-view");
}

const sendKickoff = () => {
  console.log("[HQ] send kickoff details");
};

const viewContractPacket = () => {
  router.push("/prototype/client/contract-packet");
};
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-slate-50 px-6 py-10 text-slate-900">
    <header class="space-y-2">
      <p class="text-xs uppercase tracking-[0.12em] text-slate-500">Contractor HQ · Project</p>
      <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm">
        <button
          class="rounded-full px-3 py-1"
          :class="mode === 'approval' ? 'bg-slate-900 text-white' : 'text-slate-700'"
          @click="mode = 'approval'"
        >
          Approval ready
        </button>
        <button
          class="rounded-full px-3 py-1"
          :class="mode === 'ready' ? 'bg-slate-900 text-white' : 'text-slate-700'"
          @click="mode = 'ready'"
        >
          Project ready to start
        </button>
      </div>
    </header>

    <section
      v-if="mode === 'approval'"
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{{ project.clientName }}</span>
          <span class="text-sm font-semibold text-slate-900">{{ project.projectName }}</span>
          <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{{ approvalEvent.optionLabel }} option</span>
        </div>
        <p class="text-sm text-slate-600">
          Price: <span class="font-semibold text-slate-900">{{ formatCurrency(project.price) }}</span> · Deposit:
          <span class="font-semibold text-emerald-700">{{ formatCurrency(project.depositDue) }}</span>
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <button
            class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
            @click="schedulingOpen = true"
          >
            Schedule &amp; confirm deposit
          </button>
          <span v-if="latestSchedule" class="text-xs text-slate-500">
            Last proposed: {{ latestSchedule.startDate }} · Deposit {{ formatCurrency(latestSchedule.depositDue) }}
          </span>
        </div>
      </div>
    </section>

    <section
      v-else
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <p class="text-xs uppercase tracking-[0.12em] text-slate-500">Contractor HQ · Project Start</p>
      <h1 class="text-xl font-semibold text-slate-900">{{ readyJob.projectName }} · Ready to start</h1>
      <p class="text-sm text-slate-600">Your client has approved, signed, and confirmed a schedule.</p>

      <div class="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{{ readyJob.clientName }}</span>
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{{ readyJob.optionLabel }}</span>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Price</p>
              <p class="text-sm font-semibold text-slate-900">{{ formatCurrency(readyJob.price) }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
              <p class="text-sm font-semibold text-emerald-700">{{ formatCurrency(readyJob.deposit) }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Start date</p>
              <p class="text-sm font-semibold text-slate-900">{{ readyJob.startDateLabel }}</p>
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Next steps</p>
          <ul class="mt-2 space-y-2 text-sm text-slate-800">
            <li class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Client approved &amp; signed</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Schedule confirmed</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Deposit collection scheduled</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
              <span>Kickoff details to send</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
        <button
          class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
          @click="sendKickoff"
        >
          Send kickoff details
        </button>
        <button
          class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          @click="viewContractPacket"
        >
          View contract packet
        </button>
        <button
          class="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
          @click="router.push('/prototype/hq')"
        >
          Back to job overview
        </button>
      </div>
    </section>

    <SchedulingModal
      :open="schedulingOpen"
      :project="project"
      :approval="approvalEvent"
      @close="schedulingOpen = false"
      @submit="handleScheduleSubmit"
    />
  </main>
</template>
