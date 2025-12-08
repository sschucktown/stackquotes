<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import MotionFadeIn from "@/components/schedule/MotionFadeIn.vue";

const router = useRouter();

const checklist = [
  {
    id: "access",
    title: "Confirm yard and gate access",
    description: "Make sure gates are unlocked or we have a key/code for crew arrival.",
  },
  {
    id: "utilities",
    title: "Mark utilities & obstacles",
    description: "Flag any sprinklers, buried lines, or pet areas we should know about.",
  },
  {
    id: "parking",
    title: "Plan parking & material staging",
    description: "Leave driveway or street space for lumber and crew vehicles.",
  },
  {
    id: "neighbors",
    title: "Give neighbors a heads up",
    description: "Let nearby neighbors know we’ll be working on your deck those days.",
  },
  {
    id: "pets",
    title: "Plan for pets & kids",
    description: "Keep kids and pets clear of the work area during build days.",
  },
];

const jobSummary = {
  clientName: "Sarah Thompson",
  projectName: "Maple St Deck",
  startDateLabel: "Friday, December 12, 2025",
};

const completed = ref<string[]>([]);

const toggle = (id: string) => {
  if (completed.value.includes(id)) {
    completed.value = completed.value.filter((item) => item !== id);
  } else {
    completed.value = [...completed.value, id];
  }
};

const progressLabel = computed(() => `${completed.value.length} of ${checklist.length} items completed`);
const progressPercent = computed(() => Math.round((completed.value.length / checklist.length) * 100));
const allDone = computed(() => completed.value.length === checklist.length);
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <MotionFadeIn>
        <section class="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Before we start your project</p>
          <h1 class="text-xl font-semibold text-slate-900">A quick checklist to make the first day smooth.</h1>
          <p class="mt-1 text-sm text-slate-600">
            {{ jobSummary.projectName }} · Starts {{ jobSummary.startDateLabel }}
          </p>
        </section>
      </MotionFadeIn>

      <MotionFadeIn>
        <section class="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-slate-900">{{ progressLabel }}</p>
            <div class="h-2 w-full rounded-full bg-slate-100 sm:w-56">
              <div class="h-2 rounded-full bg-emerald-500 transition-all" :style="{ width: `${progressPercent}%` }"></div>
            </div>
          </div>

          <div class="space-y-3">
            <button
              v-for="item in checklist"
              :key="item.id"
              type="button"
              class="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-white"
              @click="toggle(item.id)"
            >
              <span
                class="mt-1 grid h-6 w-6 place-items-center rounded-full border"
                :class="completed.includes(item.id) ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-300 bg-white text-slate-400'"
              >
                <span v-if="completed.includes(item.id)">✓</span>
              </span>
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
                <p class="text-sm text-slate-600">{{ item.description }}</p>
              </div>
            </button>
          </div>

          <p class="text-sm text-slate-600">
            <span v-if="allDone">You’re all set for day one. We’ll see you soon.</span>
            <span v-else>You can come back to this anytime before the start date.</span>
          </p>
        </section>
      </MotionFadeIn>
    </div>

    <div class="sticky inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-6px_20px_-18px_rgba(15,23,42,0.3)] sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-4xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-xs text-slate-500">This checklist is optional, but highly recommended.</p>
        <button
          class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          @click="router.push('/prototype/smartproposal/client')"
        >
          Back to project details
        </button>
      </div>
    </div>
  </main>
</template>
