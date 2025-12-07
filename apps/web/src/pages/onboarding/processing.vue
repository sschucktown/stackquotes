<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-6 sm:py-8 lg:px-8">
      <OnboardingStepper current-step="processing" class="mb-6" />
      <PageTransition>
        <ProcessingProposal />
      </PageTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProcessingProposal from "@/components/OnboardingPrototype/ProcessingProposal.vue";
import OnboardingStepper from "@/components/OnboardingPrototype/OnboardingStepper.vue";
import PageTransition from "@/components/OnboardingPrototype/PageTransition.vue";
</script>
