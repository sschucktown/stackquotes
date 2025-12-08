<script setup lang="ts">
import MotionFadeIn from "@/components/schedule/MotionFadeIn.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
    <MotionFadeIn>
      <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white px-7 py-8 shadow-xl">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ExclamationTriangleIcon class="h-8 w-8" />
        </div>
        <h1 class="mt-4 text-center text-2xl font-semibold">We’ve sent your request</h1>
        <p class="mt-1 text-center text-sm text-slate-600">Your contractor will propose a new available start date.</p>

        <ul class="mt-6 space-y-3 text-sm text-slate-700">
          <li class="flex items-start gap-3">
            <span class="mt-[6px] h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <div>
              <p class="font-semibold text-slate-900">Schedule proposed</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-[6px] h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <div>
              <p class="font-semibold text-slate-900">You requested a new date</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-[6px] h-2.5 w-2.5 rounded-full bg-slate-300"></span>
            <div>
              <p class="font-semibold text-slate-900">Awaiting contractor reply</p>
            </div>
          </li>
        </ul>

        <div class="mt-6 flex justify-center">
          <button
            class="w-full rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 sm:w-auto"
            @click="router.push('/prototype/client-portal')"
          >
            Return to proposal
          </button>
        </div>
      </div>
    </MotionFadeIn>
  </main>
</template>
