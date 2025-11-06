<template>
  <div class="min-h-screen w-full text-white bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
    <!-- HERO -->
    <header class="relative">
      <div class="absolute inset-0 pointer-events-none">
        <div class="animate-pulse-slow opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent h-[40rem] w-[40rem] rounded-full blur-3xl mx-auto mt-[-10rem]"></div>
      </div>
      <div class="container mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        <div class="max-w-3xl mx-auto text-center space-y-6" data-animate>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
            Close More Jobs with Proposals Clients Accept Instantly
          </h1>
          <p class="text-gray-300 text-lg md:text-xl">
            StackQuotes Pro helps contractors create Good/Better/Best quotes in minutes — complete with instant approvals and payments.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2" data-animate>
            <a
              href="/auth"
              class="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium bg-[#00D1FF] text-gray-900 shadow-[0_0_0_0_rgba(0,209,255,0.6)] hover:shadow-[0_0_25px_6px_rgba(0,209,255,0.45)] transition-all duration-200 hover:scale-[1.02] focus:outline-none"
            >
              Start Free for 30 Days
            </a>
            <button
              @click="openDemo = true"
              class="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Watch 60-Second Demo
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- TRUST STRIP -->
    <section class="border-y border-white/10 bg-gray-900/30">
      <div class="container mx-auto px-6 py-10 text-center">
        <blockquote class="text-xl md:text-2xl font-medium" data-animate>
          “Contractors close 3x more jobs when clients can compare and accept upgrades instantly.”
        </blockquote>
        <p class="text-gray-400 mt-3" data-animate>
          Backed by proposal analytics from early users.
        </p>
      </div>
    </section>

    <!-- FEATURE PILLARS -->
    <section id="features" class="container mx-auto px-6 py-16 md:py-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/10 transition-shadow" data-animate>
          <div class="h-10 w-10 rounded-full bg-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Build Polished Proposals</h3>
          <ul class="text-gray-300 space-y-1 list-disc list-inside">
            <li>Auto-generate Good/Better/Best quotes</li>
            <li>Branded templates and smart upsells</li>
          </ul>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/10 transition-shadow" data-animate>
          <div class="h-10 w-10 rounded-full bg-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Instant Approvals + Deposits</h3>
          <ul class="text-gray-300 space-y-1 list-disc list-inside">
            <li>Clients sign + pay on any device</li>
            <li>ACH + card payments, real-time tracking</li>
          </ul>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/10 transition-shadow" data-animate>
          <div class="h-10 w-10 rounded-full bg-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h3.75c.621 0 1.125.504 1.125 1.125v6.75C9 20.496 8.496 21 7.875 21h-3.75A1.125 1.125 0 0 1 3 19.875v-6.75ZM9 8.625C9 8.004 9.504 7.5 10.125 7.5h3.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-3.75A1.125 1.125 0 0 1 9 19.875V8.625ZM15 4.125C15 3.504 15.504 3 16.125 3h3.75C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-3.75A1.125 1.125 0 0 1 15 19.875V4.125Z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Built-In Analytics</h3>
          <ul class="text-gray-300 space-y-1 list-disc list-inside">
            <li>Track acceptance rate + revenue lift</li>
            <li>Measure ROI in ProfitPulse</li>
          </ul>
        </div>
      </div>
      <div class="text-center mt-10" data-animate>
        <a href="/app/smart-proposals" class="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium bg-[#00D1FF] text-gray-900 shadow-[0_0_0_0_rgba(0,209,255,0.6)] hover:shadow-[0_0_25px_6px_rgba(0,209,255,0.45)] transition-all duration-200 hover:scale-[1.02]">
          Start Building Your First Proposal
        </a>
      </div>
    </section>

    <!-- DEMO PREVIEW STRIP -->
    <section class="bg-white/5 border-y border-white/10">
      <div class="container mx-auto px-6 py-14 md:py-16 grid md:grid-cols-2 gap-8 items-center">
        <div class="order-2 md:order-1 space-y-4" data-animate>
          <h3 class="text-2xl font-semibold">Clients choose, sign, and pay — you get paid next-day.</h3>
          <div class="flex gap-3">
            <button @click="openDemo = true" class="rounded-full px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 transition">
              Try Demo Mode
            </button>
            <a href="/auth" class="rounded-full px-5 py-3 bg-[#00D1FF] text-gray-900 hover:opacity-95 transition">
              Start Free Trial
            </a>
          </div>
        </div>
        <div class="order-1 md:order-2" data-animate>
          <div class="relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 aspect-[16/10] flex items-center justify-center">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,209,255,0.12),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(0,209,255,0.08),transparent_40%)]"></div>
            <div class="relative z-10 text-center">
              <div class="mx-auto w-20 h-20 rounded-full bg-[#00D1FF]/20 border border-[#00D1FF]/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00D1FF" class="w-10 h-10 ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p class="mt-3 text-gray-300">Accept & Pay – preview</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SIMPLE PRICING -->
    <section id="pricing" class="container mx-auto px-6 py-16 md:py-20">
      <div class="max-w-3xl mx-auto text-center space-y-4" data-animate>
        <h3 class="text-3xl font-semibold">StackQuotes Pro – $79/mo</h3>
        <p class="text-gray-300">Everything you need to quote, close, and get paid.</p>
      </div>
      <div class="max-w-3xl mx-auto mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8" data-animate>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-200">
          <li class="flex items-start gap-2">
            <CheckIcon class="mt-1 text-[#00D1FF]" />
            <span>Unlimited Proposals</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckIcon class="mt-1 text-[#00D1FF]" />
            <span>Good/Better/Best Templates</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckIcon class="mt-1 text-[#00D1FF]" />
            <span>Instant Payments (1% fee)</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckIcon class="mt-1 text-[#00D1FF]" />
            <span>Analytics & ProfitPulse Dashboard</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckIcon class="mt-1 text-[#00D1FF]" />
            <span>QuickBooks Sync</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckIcon class="mt-1 text-[#00D1FF]" />
            <span>Full Team Access (up to 5 users)</span>
          </li>
        </ul>
        <p class="text-gray-400 text-sm mt-5">30 days free. No card required. Cancel anytime.</p>
        <div class="text-center mt-6">
          <a href="/pricing" class="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium bg-[#00D1FF] text-gray-900 shadow-[0_0_0_0_rgba(0,209,255,0.6)] hover:shadow-[0_0_25px_6px_rgba(0,209,255,0.45)] transition-all duration-200 hover:scale-[1.02]">
            Start Free for 30 Days
          </a>
        </div>
      </div>
    </section>

    <!-- WHY IT WORKS -->
    <section class="container mx-auto px-6 py-12 md:py-16" data-animate>
      <h3 class="text-2xl font-semibold text-center mb-6">Why It Works</h3>
      <div class="overflow-hidden rounded-xl border border-white/10">
        <table class="w-full text-left text-gray-200">
          <thead class="bg-white/5">
            <tr>
              <th class="px-4 py-3">Pain</th>
              <th class="px-4 py-3">Old Way</th>
              <th class="px-4 py-3">StackQuotes Pro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr>
              <td class="px-4 py-3">Time</td>
              <td class="px-4 py-3">Hours formatting in Word</td>
              <td class="px-4 py-3">5-minute templates</td>
            </tr>
            <tr>
              <td class="px-4 py-3">Conversion</td>
              <td class="px-4 py-3">Clients ghosting</td>
              <td class="px-4 py-3">Clients upgrade + pay instantly</td>
            </tr>
            <tr>
              <td class="px-4 py-3">Cash Flow</td>
              <td class="px-4 py-3">Chasing checks</td>
              <td class="px-4 py-3">Next-day ACH</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="container mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-6" data-animate>
      <figure class="rounded-xl border border-white/10 bg-white/5 p-6">
        <blockquote class="text-lg">“It paid for itself the first week. My proposals look 10x better and close faster.”</blockquote>
        <figcaption class="text-gray-400 mt-3">— Michael Torres, Deck Builder, FL</figcaption>
      </figure>
      <figure class="rounded-xl border border-white/10 bg-white/5 p-6">
        <blockquote class="text-lg">“I use StackQuotes on my phone between jobs — instant deposits!”</blockquote>
        <figcaption class="text-gray-400 mt-3">— Heather Nguyen, Remodeler, TX</figcaption>
      </figure>
    </section>

    <!-- FOOTER CTA -->
    <footer class="border-t border-white/10">
      <div class="container mx-auto px-6 py-12 text-center space-y-5" data-animate>
        <p class="text-lg md:text-xl">You build beautiful projects. StackQuotes helps you sell them.</p>
        <a href="/auth" class="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium bg-[#00D1FF] text-gray-900 hover:opacity-95 transition">
          Start Free for 30 Days
        </a>
        <nav class="flex flex-wrap gap-x-5 gap-y-2 justify-center text-gray-400 text-sm pt-2">
          <a href="#features" class="hover:text-white">Features</a>
          <a href="/pricing" class="hover:text-white">Pricing</a>
          <a href="/auth" class="hover:text-white">Login</a>
          <a href="#" class="hover:text-white">Blog</a>
          <a href="#" class="hover:text-white">Terms</a>
          <a href="#" class="hover:text-white">Privacy</a>
        </nav>
      </div>
    </footer>

    <!-- DEMO MODAL -->
    <div v-if="openDemo" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="w-[90vw] max-w-3xl rounded-2xl overflow-hidden border border-white/10 bg-gray-900">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h4 class="font-medium">StackQuotes Demo</h4>
          <button @click="openDemo = false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-4">
          <div class="relative aspect-video rounded-xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,209,255,0.12),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(0,209,255,0.08),transparent_40%)]"></div>
            <div class="text-center relative z-10 space-y-2">
              <div class="mx-auto w-16 h-16 rounded-full bg-[#00D1FF]/20 border border-[#00D1FF]/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00D1FF" class="w-8 h-8 ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p class="text-gray-300">60-second walkthrough coming soon.</p>
            </div>
          </div>
        </div>
        <div class="px-4 pb-4">
          <a href="/auth" class="inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-medium bg-[#00D1FF] text-gray-900 hover:opacity-95 transition w-full md:w-auto">Start Free Trial</a>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const openDemo = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )

  document.querySelectorAll('[data-animate]').forEach((el) => {
    ;(el as HTMLElement).classList.add('opacity-0', 'translate-y-4')
    observer.observe(el)
  })
})

const CheckIcon = (props: { class?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class={props.class ?? ''}
    width="20"
    height="20"
  >
    <path
      fill-rule="evenodd"
      d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm14.28-2.03a.75.75 0 00-1.06-1.06L10.5 13.88l-1.97-1.97a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l5.5-5.5z"
      clip-rule="evenodd"
    />
  </svg>
)
</script>

<style scoped>
.container { max-width: 1100px; }

@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fadeUp 600ms ease forwards;
}
.animate-pulse-slow {
  animation: pulseSlow 6s ease-in-out infinite;
}
@keyframes pulseSlow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
