<script setup lang="ts">
import { mockProposal } from "./data/mockProposal";
import ClientProposalShell from "./components/ClientProposalShell.vue";
</script>

<template>
  <ClientProposalShell :proposal="mockProposal" />
</template>
