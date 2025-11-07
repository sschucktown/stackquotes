<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useContractorProfileStore } from '@/modules/contractor/stores/profileStore'
import { useEstimateStore } from '@/modules/quickquote/stores/estimateStore'
import ActionCard from '@/components/dashboard/ActionCard.vue'

const router = useRouter()
const profileStore = useContractorProfileStore()
const estimateStore = useEstimateStore()

// Derived user flags
const profileComplete = computed(() => {
  const p = profileStore.profile
  if (!p) return false
  return Boolean(p.businessName && p.phone && p.email)
})
const stripeConnected = computed(() => profileStore.profile?.stripeAccountStatus === 'active')
const quickQuotesCount = computed(() => estimateStore.items.length)

const user = computed(() => ({
  profileComplete: profileComplete.value,
  stripeConnected: stripeConnected.value,
  quickQuotesCount: quickQuotesCount.value,
}))

type StarterCard = {
  id: string
  title: string
  description: string
  ctaText: string
  ctaRoute: string
  icon: string
  visible: boolean
}

const allCards = computed<StarterCard[]>(() => [
  {
    id: 'get_visible',
    title: 'Get Visible',
    description: 'Add your business info so clients know who they’re dealing with.',
    ctaText: 'Finish Profile',
    ctaRoute: '/settings',
    icon: 'Eye',
    visible: !user.value.profileComplete,
  },
  {
    id: 'get_paid',
    title: 'Get Paid',
    description: 'Set up payments once—then get paid automatically when clients accept.',
    ctaText: 'Connect Stripe',
    ctaRoute: '/payments',
    icon: 'CreditCard',
    visible: !user.value.stripeConnected,
  },
  {
    id: 'get_busy',
    title: 'Get Busy',
    description: 'It only takes 2 minutes to send your first professional quote.',
    ctaText: 'Start QuickQuote',
    ctaRoute: '/quickquotes/new',
    icon: 'Hammer',
    visible: user.value.quickQuotesCount === 0,
  },
])

const visibleCards = computed(() => allCards.value.filter(c => c.visible))

const emit = defineEmits<{
  (e: 'visible-count', payload: { visible: number; total: number }): void
}>()

// Confetti + banner when all done
const showBanner = ref(false)
const confettiCanvas = ref<HTMLCanvasElement | null>(null)
let confettiRAF: number | null = null
let confettiTimer: ReturnType<typeof setTimeout> | null = null
const running = ref(false)

type Piece = { x:number;y:number;vx:number;vy:number;size:number;color:string;rot:number;vr:number }
let pieces: Piece[] = []
const COLORS = ['#22c55e','#10b981','#34d399','#a7f3d0','#fde68a','#60a5fa']

const startConfetti = () => {
  if (running.value) return
  const canvas = confettiCanvas.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  const parent = canvas.parentElement as HTMLElement | null
  const width = parent?.clientWidth ?? 360
  const height = 120
  canvas.width = width
  canvas.height = height
  pieces = Array.from({ length: 60 }, () => ({
    x: Math.random() * width,
    y: -10 - Math.random() * 40,
    vx: -1 + Math.random() * 2,
    vy: 2 + Math.random() * 3,
    size: 6 + Math.random() * 6,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    rot: Math.random() * Math.PI,
    vr: -0.2 + Math.random() * 0.4,
  }))
  running.value = true
  const step = () => {
    if (!running.value) return
    ctx.clearRect(0,0,width,height)
    for (const p of pieces) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.03
      p.rot += p.vr
      if (p.y > height + 20) {
        if (Math.random() < 0.2) {
          p.y = -10
          p.x = Math.random() * width
          p.vy = 2 + Math.random() * 2
        }
      }
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6)
      ctx.restore()
    }
    confettiRAF = requestAnimationFrame(step)
  }
  step()
  confettiTimer = setTimeout(() => stopConfetti(true), 2000)
}

const stopConfetti = (reveal = false) => {
  running.value = false
  if (confettiRAF) cancelAnimationFrame(confettiRAF)
  confettiRAF = null
  if (confettiTimer) clearTimeout(confettiTimer)
  confettiTimer = null
  showBanner.value = reveal
}

onBeforeUnmount(() => stopConfetti(false))

onMounted(async () => {
  // Ensure data is loaded
  if (!profileStore.profile && !profileStore.loading) {
    try { await profileStore.load() } catch {}
  }
  if (!estimateStore.items.length && !estimateStore.loading) {
    try { await estimateStore.load() } catch {}
  }
  // If already complete, show banner without animating confetti repeatedly
  if (!visibleCards.value.length) {
    showBanner.value = true
  }
  emit('visible-count', { visible: visibleCards.value.length, total: allCards.value.length })
})

// Watch for completion and fire confetti once when transitioning to zero
let prevCount = visibleCards.value.length
watchEffect(() => {
  const current = visibleCards.value.length
  emit('visible-count', { visible: current, total: allCards.value.length })
  if (current === 0 && prevCount > 0) {
    startConfetti()
  }
  if (current > 0) {
    showBanner.value = false
    stopConfetti(false)
  }
  prevCount = current
})

const go = (route: string) => router.push(route)
</script>

<template>
  <section class="relative z-30 rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
    <header class="mb-3">
      <h2 class="text-base font-semibold text-slate-900">Getting Started</h2>
      <p class="text-sm text-slate-600">Finish these steps to unlock fast quoting.</p>
    </header>

    <transition-group name="collapse" tag="div" class="grid gap-3 md:grid-cols-3">
      <ActionCard
        v-for="card in visibleCards"
        :key="card.id"
        :title="card.title"
        :description="card.description"
        :cta-text="card.ctaText"
        :cta-route="card.ctaRoute"
        :icon="card.icon"
        @click="go(card.ctaRoute)"
      />
    </transition-group>

    <transition name="fade">
      <div v-if="!visibleCards.length" class="relative mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800">
        <p class="text-sm">✅ You’re ready to quote. Send your first SmartProposal!</p>
        <canvas ref="confettiCanvas" class="pointer-events-none absolute inset-x-0 -top-2 h-[120px] w-full"></canvas>
      </div>
    </transition>
  </section>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{ transition: opacity .25s ease }
.fade-enter-from,.fade-leave-to{ opacity:0 }

.collapse-enter-active,.collapse-leave-active{ transition: all .25s ease }
.collapse-enter-from,.collapse-leave-to{ opacity:0; transform: translateY(10px) }
</style>
