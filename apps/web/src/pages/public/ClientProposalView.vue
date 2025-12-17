<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { ProposalOption } from "@stackquotes/types";

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
   Proposal composable (NO ref wrapper)
---------------------------- */
let proposalApi:
  | ReturnType<typeof useProposal>
  | null = null;

/* ----------------------------
   Initialize when token exists
---------------------------- */
watch(
  token,
  (t) => {
    if (!t) return;

    console.log("[ClientProposalView] initializing with token:", t);

    proposalApi = useProposal(t);
    proposalApi.load();
  },
  { immediate: true }
);

/* ----------------------------
   Safe computed accessors
---------------------------- */
const loading = computed(() => proposalApi?.loading.value ?? false);
const error = computed(() => proposalApi?.error.value ?? null);
const payload = computed(
  () => proposalApi?.proposalDisplayPayload.value ?? null
);

const proposal = computed(() => payload.value?.proposal ?? null);
const contractor = computed(() => payload.value?.contractor ?? null);

/* ----------------------------
   Package options
---------------------------- */
const packageOptions = computed(() => {
  const opts = proposal.value?.options ?? [];
  return opts.map((option: ProposalOption) => ({
    option,
    trade: resolveTradeFromAbstractKey(option.visual?.abstract_key),
    tier: resolveTierFromAbstractKey(option.visual?.abstract_key),
  }));
});

/* ----------------------------
   Selection (auto-select)
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

  try {
    await acceptPublicProposal(
      proposal.value.publicToken,
      selectedOptionName.value
    );
    await proposalApi?.load();
  } finally {
    submitting.value = false;
  }
};
</script>
