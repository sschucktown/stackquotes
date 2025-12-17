<script setup lang="ts">
import { computed, ref, watch } from "vue";
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

const token = computed(() => {
  const p = route.params as Record<string, unknown>;
  return typeof p.id === "string" ? p.id : "";
});

console.log("[ClientProposalView] token:", token.value);

/* ----------------------------
   Proposal composable (NO ARGS)
---------------------------- */
const {
  loading,
  error,
  proposalDisplayPayload,
  load,
} = useProposal();

/* ----------------------------
   Load proposal when token exists
---------------------------- */
watch(
  token,
  async (t) => {
    if (!t) return;
    console.log("[ClientProposalView] loading proposal:", t);
    await load(t);
  },
  { immediate: true }
);

/* ----------------------------
   Derived state
---------------------------- */
const proposal = computed(() => proposalDisplayPayload.value?.proposal ?? null);
const contractor = computed(() => proposalDisplayPayload.value?.contractor ?? null);

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

const selectOption = (name: string) => {
  selectedOptionName.value = name;
};

const accept = async () => {
  if (!proposal.value?.publicToken) return;
  if (!selectedOptionName.value) return;
  if (proposal.value.status === "accepted") return;

  submitting.value = true;
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
