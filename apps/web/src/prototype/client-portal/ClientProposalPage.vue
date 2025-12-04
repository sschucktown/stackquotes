<script setup lang="ts">
import { mockProposal } from "./data/mockProposal";
import ClientProposalShell from "./components/ClientProposalShell.vue";
import ProposalCommentsFab from "../../components/proposals/ProposalCommentsFab.vue";
</script>

<template>
  <ClientProposalShell :proposal="mockProposal" />
  <ProposalCommentsFab :proposal-id="mockProposal.id" :contractor-name="mockProposal.contractorBrand.name" />
</template>
