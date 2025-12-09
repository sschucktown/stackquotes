<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import SignaturePad from "signature_pad";

const props = defineProps<{
  open: boolean;
  proposalId: string;
  acceptedOption: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "signed"): void;
}>();

// SignaturePad instance
const canvasRef = ref<HTMLCanvasElement | null>(null);
let pad: SignaturePad | null = null;

// State
const saving = ref(false);
const error = ref<string | null>(null);

// Resize canvas for high-DPI devices
const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ratio = Math.max(window.devicePixelRatio || 1, 1);

  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d")?.scale(ratio, ratio);

  if (pad) pad.clear();
};

onMounted(() => {
  watch(
    () => props.open,
    async (isOpen) => {
      if (isOpen) {
        await nextTick();
        resizeCanvas();
        pad = new SignaturePad(canvasRef.value!, {
          minWidth: 1.5,
          maxWidth: 3.0,
          penColor: "#111",
        });
      }
    },
    { immediate: true }
  );

  window.addEventListener("resize", resizeCanvas);
});

// Clear signature
const clear = () => {
  pad?.clear();
};

// Submit
const saveSignature = async () => {
  if (!pad || pad.isEmpty()) {
    error.value = "Please add a signature before continuing.";
    return;
  }

  error.value = null;
  saving.value = true;

  try {
    const pngData = pad.toDataURL("image/png");

    const res = await fetch(`/api/smartproposals/${props.proposalId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature_image: pngData,
        signed_option: props.acceptedOption,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to save signature: ${res.status}`);
    }

    emit("signed");
  } catch (err: any) {
    error.value = err.message ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-lg scale-100 rounded-2xl bg-white p-6 shadow-xl transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-slate-900">Sign to Approve</h2>
          <button
            class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            @click="emit('close')"
            :disabled="saving"
          >
            ✕
          </button>
        </div>

        <p class="text-sm text-slate-600 mb-4">
          Sign below to approve the <strong>{{ acceptedOption }}</strong> option.
        </p>

        <div class="relative border border-slate-300 rounded-xl bg-slate-50">
          <canvas
            ref="canvasRef"
            class="w-full h-48 rounded-xl touch-none"
          ></canvas>
        </div>

        <div class="mt-2 text-right">
          <button
            class="text-sm font-medium text-slate-600 hover:text-slate-900"
            @click="clear"
            :disabled="saving"
          >
            Clear
          </button>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>

        <div class="mt-6 flex flex-col gap-3">
          <button
            class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="saveSignature"
            :disabled="saving"
          >
            <span v-if="!saving">Sign & Approve</span>
            <span v-else class="flex items-center gap-2">
              <svg
                class="h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Saving...
            </span>
          </button>

          <button
            class="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="emit('close')"
            :disabled="saving"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
