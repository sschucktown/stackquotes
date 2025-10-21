<template>
  <div class="relative overflow-hidden bg-slate-950 text-white">
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-90" />
      <div class="absolute -left-32 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl md:-left-16 md:h-96 md:w-96" />
      <div class="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl md:-right-10 md:h-[28rem] md:w-[28rem]" />
    </div>
    <div class="relative">
      <header class="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-20 md:px-10 lg:flex-row lg:items-center lg:gap-12 lg:pb-28 lg:pt-24">
        <div class="max-w-3xl space-y-8 lg:w-1/2">
          <div class="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.4em] text-cyan-200/90">
            <span class="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.25)]" />
            <span>Close More Jobs</span>
            <span class="text-white/40">Good / Better / Best</span>
          </div>
          <h1 class="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Close more jobs with 3-option quotes your clients can accept instantly.
          </h1>
          <p class="max-w-xl text-base text-slate-200 sm:text-lg">
            StackQuotes helps contractors send polished Good/Better/Best proposals, capture signatures, and get paid
            faster. Everything is wired into your workflow — from instant deposits to automated follow-up.
          </p>
          <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <button
              type="button"
              class="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:w-auto"
              @click="primaryCta.onClick?.()"
            >
              <span>{{ primaryCta.label }}</span>
              <span class="hidden items-center text-xs font-medium tracking-wide sm:flex">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10.293 3.293a1 1 0 0 1 1.414 0l5 5a.997.997 0 0 1 .083.094l.007.01.002.003a.993.993 0 0 1 .085.148l.01.02a1.003 1.003 0 0 1 .073.228l.003.02a1 1 0 0 1 .03.242v.02a1 1 0 0 1-.03.242l-.003.02a1.003 1.003 0 0 1-.073.228l-.01.02a.993.993 0 0 1-.085.148l-.002.003-.007.01a.997.997 0 0 1-.083.094l-5 5a1 1 0 0 1-1.414-1.414L13.586 11H4a1 1 0 1 1 0-2h9.586l-3.293-3.293a1 1 0 0 1 0-1.414Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </button>
            <button
              type="button"
              class="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 sm:w-auto"
              @click="founderCta.onClick?.()"
            >
              <span>{{ founderCta.label }}</span>
              <span class="hidden text-xs font-medium tracking-wide text-cyan-200/90 group-hover:translate-x-1 group-hover:text-cyan-100 sm:flex">
                {{ founderCta.tagline }}
              </span>
            </button>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-semibold text-cyan-200 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:w-auto"
              @click="demoCta.onClick?.()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4 2a2 2 0 0 0-2 2v12a1 1 0 1 0 2 0V4h10a2 2 0 0 0-2-2H4Zm4.293 4.293a1 1 0 0 1 1.414 0L14 10.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0L9.707 9.414l-2.293 2.293A1 1 0 0 1 6 10.293l3-3a1 1 0 0 1 1.293-.293Z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ demoCta.label }}</span>
            </button>
          </div>
          <dl class="mt-6 grid gap-4 sm:grid-cols-2">
            <div v-for="stat in heroStats" :key="stat.label" class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <dt class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">{{ stat.label }}</dt>
              <dd class="mt-2 text-2xl font-semibold text-white">{{ stat.value }}</dd>
              <p class="mt-1 text-sm text-slate-300/90">{{ stat.caption }}</p>
            </div>
          </dl>
        </div>
        <div class="relative w-full max-w-xl shrink-0 self-center rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg lg:w-1/2">
          <div class="absolute -left-10 top-10 hidden h-24 w-24 rounded-full border border-cyan-200/30 bg-cyan-400/20 blur-xl lg:block" />
          <img
            :src="heroImage"
            :alt="heroAlt"
            class="w-full rounded-[1.75rem] border border-white/10 shadow-2xl"
          />
          <div class="mt-6 space-y-3 text-sm text-slate-200/80">
            <p class="flex items-center gap-2">
              <span class="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Live Demo</span>
              <span>Good / Better / Best quote with instant payments</span>
            </p>
            <div class="grid gap-2 sm:grid-cols-2">
              <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p class="text-xs uppercase tracking-wide text-white/70">Avg. acceptance</p>
                <p class="mt-1 text-lg font-semibold text-white">44% lift</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p class="text-xs uppercase tracking-wide text-white/70">Fastest payout</p>
                <p class="mt-1 text-lg font-semibold text-white">Next-day ACH</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section class="mx-auto max-w-6xl px-6 pb-20 md:px-10 lg:pb-28">
        <div class="grid gap-8 lg:grid-cols-3">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.08]"
          >
            <div class="inline-flex items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-400/15 p-3 text-cyan-200">
              <component :is="feature.icon" class="h-5 w-5" />
            </div>
            <h3 class="mt-6 text-xl font-semibold text-white">{{ feature.title }}</h3>
            <p class="mt-3 text-sm text-slate-300/90">{{ feature.description }}</p>
            <ul v-if="feature.points?.length" class="mt-4 space-y-2 text-sm text-slate-300/80">
              <li
                v-for="point in feature.points"
                :key="point"
                class="flex items-start gap-2"
              >
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                <span>{{ point }}</span>
              </li>
            </ul>
          </article>
        </div>
      </section>
      <section class="mx-auto max-w-5xl px-6 pb-24 md:px-10 lg:pb-32">
        <div class="grid gap-10 rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur md:grid-cols-[auto,1fr] md:items-center md:gap-12 lg:gap-16">
          <div class="relative h-32 w-32 overflow-hidden rounded-3xl border border-white/20 bg-white/10 md:h-40 md:w-40">
            <img
              :src="founderImage"
              :alt="founderAlt"
              class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 border border-white/20 mix-blend-overlay" />
          </div>
          <div class="space-y-6">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200/70">founder insight</p>
              <p class="mt-3 text-2xl font-semibold text-white">
                “Contractors close 3x more jobs when homeowners see clear upgrade paths and can accept on the spot.
                StackQuotes turns every estimate into a conversion engine.”
              </p>
            </div>
            <div class="flex items-center gap-4 text-sm text-slate-200/90">
              <div>
                <p class="font-semibold text-white">Alex Rivers</p>
                <p class="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Founder, StackQuotes</p>
              </div>
              <div class="hidden h-px flex-1 bg-white/10 sm:block" />
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/90 transition hover:bg-white/20"
                @click="founderCta.onClick?.()"
              >
                Join the founding cohort
              </button>
            </div>
          </div>
        </div>
      </section>
      <footer class="mx-auto max-w-5xl px-6 pb-20 md:px-10 lg:pb-24">
        <div class="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-cyan-400/20 via-white/10 to-transparent p-10 text-center backdrop-blur">
          <p class="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-100/70">Ready in Minutes</p>
          <h2 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Start with our Good/Better/Best templates and send your first proposal today.
          </h2>
          <p class="mt-4 text-base text-slate-200/90 sm:text-lg">
            No credit card required for 30 days. Bring your crew, drop in your pricing, and convert the next lead with a
            polished proposal that pays you faster.
          </p>
          <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:w-auto"
              @click="primaryCta.onClick?.()"
            >
              {{ primaryCta.label }}
            </button>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 sm:w-auto"
              @click="demoCta.onClick?.()"
            >
              {{ demoCta.label }}
            </button>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from "vue";

interface CTAConfig {
  label: string;
  tagline?: string;
  onClick?: () => void;
}

interface FeatureConfig {
  title: string;
  description: string;
  points?: string[];
  icon: FunctionalComponent;
}

defineProps<{
  primaryCta: CTAConfig;
  founderCta: CTAConfig;
  demoCta: CTAConfig;
  heroImage: string;
  heroAlt: string;
  founderImage: string;
  founderAlt: string;
  heroStats: Array<{ label: string; value: string; caption: string }>;
  features: FeatureConfig[];
}>();
</script>
