<script setup lang="ts">
import { ref } from "vue";
import SignaturePad from "signature_pad";

const props = defineProps<{
  open: boolean;
  proposalId: string;
  acceptedOption: string;
  onClose: () => void;
  onSuccess: () => void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const pad = ref<SignaturePad | null>(null);
const empty = ref(true);
const loading = ref(false);

onMounted(() => {
  if (canvasRef.value) {
    pad.value = new SignaturePad(canvasRef.value, {
      penColor: "black",
      backgroundColor: "white",
    });

    pad.value.onBegin = () => {
      empty.value = false;
    };
  }
});

const clear = () => {
  pad.value?.clear();
  empty.value = true;
};

const finalize = async () => {
  if (!pad.value || pad.value.isEmpty()) {
    alert("Please sign before submitting.");
    return;
  }

  loading.value = true;

  const base64 = pad.value.toDataURL("image/png");

  const res = await fetch(`/api/smartproposals/${props.proposalId}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accepted_option: props.acceptedOption,
      signature_image: base64,
    }),
  });

  loading.value = false;

  if (!res.ok) {
    console.error(await res.json());
    alert("Failed to save signature");
    return;
  }

  props.onSuccess();
};
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold text-slate-900">Sign to Approve</h2>
        <button class="text-slate-500 hover:text-slate-700" @click="onClose">✕</button>
      </div>

      <div class="border border-slate-300 rounded-lg overflow-hidden">
        <canvas ref="canvasRef" class="w-full h-48 bg-white"></canvas>
      </div>

      <div v-if="empty" class="text-center text-sm text-slate-400 mt-1">
        Sign in the box above
      </div>

      <div class="mt-4 flex justify-between items-center">
        <button
          class="px-4 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
          @click="clear"
        >
          Clear
        </button>

        <button
          class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          :disabled="loading"
          @click="finalize"
        >
          <span v-if="loading">Saving…</span>
          <span v-else>Submit Signature</span>
        </button>
      </div>
    </div>
  </div>
</template>
