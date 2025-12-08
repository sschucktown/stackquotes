<script setup lang="ts">
import { computed } from "vue";
import { useClientSchedulePrototype } from "@/stores/useClientSchedulePrototype";
import ScheduleConfirmationCard from "@/components/schedule/ScheduleConfirmationCard.vue";
import ScheduleActions from "@/components/schedule/ScheduleActions.vue";
import EmptyScheduleState from "@/components/schedule/EmptyScheduleState.vue";
import MotionFadeIn from "@/components/schedule/MotionFadeIn.vue";
import { usePrototypePaymentStore } from "@/stores/prototypePaymentStore";

const scheduleStore = useClientSchedulePrototype();
const paymentStore = usePrototypePaymentStore();
const jobId = "job-maple";

const hasProposal = computed(() => Boolean(scheduleStore.proposedDate));
const depositPaid = computed(() => paymentStore.isPaid(jobId));

const handleConfirm = () => scheduleStore.confirmSchedule();
const handleRequestChange = () => scheduleStore.requestNewDate();
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
    <div class="flex w-full justify-center">
      <template v-if="hasProposal">
        <div class="flex flex-col items-center">
          <ScheduleConfirmationCard
            :proposed-date="scheduleStore.proposedDate || ''"
            :deposit-due="scheduleStore.depositDue || 0"
            :contractor-message="scheduleStore.contractorMessage || ''"
            :deposit-paid="depositPaid"
          />
          <MotionFadeIn class="mt-4">
            <ScheduleActions
              :on-confirm="handleConfirm"
              :on-request-change="handleRequestChange"
            />
          </MotionFadeIn>
        </div>
      </template>
      <template v-else>
        <EmptyScheduleState />
      </template>
    </div>
  </main>
</template>
