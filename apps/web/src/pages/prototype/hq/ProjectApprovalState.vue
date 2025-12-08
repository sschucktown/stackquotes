<script setup lang="ts">
import { computed, ref } from "vue";
import SchedulingModal from "@/components/HQ/SchedulingModal.vue";
import { useSchedulingStore } from "@/stores/schedulingStore";
import { useMessageStore } from "@/stores/messageStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { useApprovalEventStore } from "@/stores/approvalEventStore";
import { useAlertStore } from "@/stores/alertStore";
import { useSchedulesStore } from "@/stores/schedulesStore";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";
import { useRouter } from "vue-router";

const schedulingStore = useSchedulingStore();
const messageStore = useMessageStore();
const timelineStore = useTimelineStore();
const approvalEventStore = useApprovalEventStore();
const alertStore = useAlertStore();
const schedulesStore = useSchedulesStore();
const hqStore = useContractorHQPrototype();
const router = useRouter();

const schedulingOpen = ref(false);

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
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-slate-50 px-6 py-10 text-slate-900">
    <header>
      <p class="text-xs uppercase tracking-[0.12em] text-slate-500">Contractor HQ · Approval</p>
      <h1 class="text-2xl font-semibold">SmartProposal approval ready to schedule</h1>
      <p class="text-sm text-slate-600">Convert approval into a scheduled start date and deposit confirmation.</p>
    </header>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

    <SchedulingModal
      :open="schedulingOpen"
      :project="project"
      :approval="approvalEvent"
      @close="schedulingOpen = false"
      @submit="handleScheduleSubmit"
    />
  </main>
</template>
