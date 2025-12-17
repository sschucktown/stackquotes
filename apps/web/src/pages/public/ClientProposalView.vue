<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";

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
const token = computed(() => String(route.params.id ?? ""));

/* ----------------------------
   Proposal API
---------------------------- */
const {
  loading,
  error,
  proposalDisplayPayload,
  load,
} = useProposal();

/* ----------------------------
   Load once
---------------------------- */
onMounted(() => {
  console.log("[ClientProposalView] loading token:", token.value);
  if (token.value) {
    load(token.value);
  }
});

/* ----------------------------
   Derived state (THIS WAS THE BUG)
---------------------------- */
const proposal = computed(() => proposalDisplayPayload.value);

/* ----------------------------
   Package options
---------------------------- */
const packageOptions = computed(() => {
  const opts = proposal.value?.options ?? [];
  return opts.map((option) => ({
    option,
    trade: resolveTradeFromAbstractKey(option.visual?.abstract_key),
    tier: resolveTierFromAbstractKey(option.visual?.abstract_key),
  }));
});

/* ----------------------------
   Selection
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
  if (!proposal.value?.publicToken) return;
  if (!selectedOptionName.value) return;
  if (proposal.value.status === "accepted") return;

  submitting.value = true;
  console.log("[ClientProposalView] accepting:", selectedOptionName.value);

  try {
    await acceptPublicProposal(
      proposal.value.publicToken,
      selectedOptionName.value
    );
    await load(token.value);
  } finally {
    submitting.value = false;
  }
};
</script>
