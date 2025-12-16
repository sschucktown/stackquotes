<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { Proposal, ProposalOption } from "@stackquotes/types";
import ClientPackageCard from "@/modules/proposals/components/ClientPackageCard.vue";
import {
  resolveTradeFromAbstractKey,
  resolveTierFromAbstractKey,
} from "@/modules/proposals/utils/visualAssets";
import { acceptPublicProposal } from "@/modules/public/api/proposal";
import { useProposal } from "@/modules/public/composables/useProposal";

/* ----------------------------
   Route
---------------------------- */
const route = useRoute();
const token = String(route.params.id ?? "");

/* ----------------------------
   Composable
---------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal(token);

/* ----------------------------
   Lifecycle
---------------------------- */
onMounted(() => {
  console.log("[ClientProposalView] loading proposal:", token);
  load();
});

/* ----------------------------
   Typed derived state (CRITICAL FIX)
---------------------------- */
const proposal = computed<Proposal | null>(() => {
  return proposalDisplayPayload.value?.proposal ?? null;
});

const contractor = computed(() => {
  return proposalDisplayPayload.value?.contractor ?? null;
});

/* ----------------------------
   Package options
---------------------------- */
const packageOptions = computed(() => {
  const opts = proposal.value?.options ?? [];
  return opts.map((option: ProposalOption) => {
    const abstractKey = option.visual?.abstract_key;
    return {
      option,
      trade: resolveTradeFromAbstractKey(abstractKey),
      tier: resolveTierFromAbstractKey(abstractKey),
    };
  });
});

/* ----------------------------
   Selection (AUTO-SELECT FIX)
---------------------------- */
const selectedOptionName = ref<string | null>(null);

watch(
  () => proposal.value?.options,
  (opts) => {
    if (!selectedOptionName.value && opts?.length) {
      selectedOptionName.value = opts[0].name;
    }
  },
  { immediate: true }
);

/* ----------------------------
   Accept
---------------------------- */
const submitting = ref(false);

const accept = async () => {
  if (!proposal.value || !proposal.value.publicToken) return;
  if (!selectedOptionName.value) return;
  if (proposal.value.status === "accepted") return;

  submitting.value = true;
  console.log("[ClientProposalView] accepting:", selectedOptionName.value);

  try {
    await acceptPublicProposal(
      proposal.value.publicToken,
      selectedOptionName.value
    );
    await load();
  } finally {
    submitting.value = false;
  }
};
</script>
