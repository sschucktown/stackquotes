<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-6 sm:py-8 lg:px-8">
      <OnboardingStepper current-step="send" class="mb-6" />
      <transition name="page">
        <ProposalSent />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProposalSent from "@/components/OnboardingPrototype/ProposalSent.vue";
import OnboardingStepper from "@/components/OnboardingPrototype/OnboardingStepper.vue";
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
