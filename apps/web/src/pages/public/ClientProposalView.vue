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
   ROUTE (SOURCE OF TRUTH)
---------------------------- */
const route = useRoute();

console.log("[DEBUG] full route:", route);
console.log("[DEBUG] route.params:", route.params);
console.log("[DEBUG] route.path:", route.path);

/**
 * IMPORTANT:
 * Supports BOTH `/proposal/:id` and `/proposal/:token`
 */
const token = computed(() => {
  const params = route.params as Record<string, unknown>;
  return (
    (typeof params.id === "string" && params.id) ||
    (typeof params.token === "string" && params.token) ||
    ""
  );
});

console.log("[DEBUG] resolved token:", token.value);

/* ----------------------------
   COMPOSABLE (NO ARGS)
---------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal();

/* ----------------------------
   LOAD WHEN TOKEN EXISTS
---------------------------- */
watch(
  token,
  async (t) => {
    if (!t) {
      console.warn("[ClientProposalView] NO TOKEN – NOT LOADING");
      return;
    }

    console.log("[ClientProposalView] loading proposal with token:", t);
    await load(t);
    console.log(
      "[ClientProposalView] payload after load:",
      proposalDisplayPayload.value
    );
  },
  { immediate: true }
);

/* ----------------------------
   DERIVED STATE
---------------------------- */
const proposal = computed(() => proposalDisplayPayload.value ?? null);

const packageOptions = computed(() => {
  const opts = proposal.value?.options ?? [];
  return opts.map((option: any) => ({
    option,
    trade: resolveTradeFromAbstractKey(option.visual?.abstract_key),
    tier: resolveTierFromAbstractKey(option.visual?.abstract_key),
  }));
});

/* ----------------------------
   SELECTION
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
   ACCEPT
---------------------------- */
const submitting = ref(false);

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
