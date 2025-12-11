<script setup lang="ts">
import { ref, nextTick, watch } from "vue";

const props = defineProps<{
  open: boolean;
  proposalId: string;
  acceptedOption: string;
  onClose: () => void;
  onSuccess: (jobId: string) => void;
}>();

// --------------------------------------------------
// State
// --------------------------------------------------
const signing = ref(false);
const signatureData = ref<string | null>(null);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

let drawing = false;
let lastX = 0;
let lastY = 0;

// --------------------------------------------------
// Canvas Setup AFTER modal opens
// --------------------------------------------------
watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();

    const canvas = canvasRef.value;
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
  }
);

// --------------------------------------------------
// Drawing Logic
// --------------------------------------------------
const getPos = (e: MouseEvent | TouchEvent) => {
  const canvas = canvasRef.value!;
  const rect = canvas.getBoundingClientRect();

  let clientX = 0;
  let clientY = 0;

  if (e instanceof TouchEvent) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
};

const startDraw = (e: MouseEvent | TouchEvent) => {
  drawing = true;
  const { x, y } = getPos(e);
  lastX = x;
  lastY = y;
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!drawing || !ctx) return;
  const { x, y } = getPos(e);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
};

const endDraw = () => {
  drawing = false;
  if (!canvasRef.value) return;
  signatureData.value = canvasRef.value.toDataURL("image/png");
};

// --------------------------------------------------
// Submit Signature → Backend Approve Pipeline
// --------------------------------------------------
const submitSignature = async () => {
  if (!signatureData.value) {
    alert("Please sign before submitting.");
    return;
  }

  signing.value = true;

  try {
    const res = await fetch(`/api/smartproposals/${props.proposalId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature_image: signatureData.value,
        accepted_option: props.acceptedOption,
        proposal_id: props.proposalId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      alert("Could not approve proposal.");
      signing.value = false;
      return;
    }

    // Backend returns job_id
    props.onSuccess(data.job_id);
  } catch (err) {
    console.error(err);
    alert("Unexpected error saving signature.");
  } finally {
    signing.value = false;
  }
};
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  >
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-900">Sign to Approve</h2>

      <!-- Signature Canvas -->
      <div class="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-3">
        <canvas
          ref="canvasRef"
          width="500"
          height="200"
          class="w-full rounded-lg bg-white"
          @mousedown="startDraw"
          @mousemove="draw"
          @mouseup="endDraw"
          @mouseleave="endDraw"
          @touchstart.prevent="startDraw"
          @touchmove.prevent="draw"
          @touchend.prevent="endDraw"
        ></canvas>
      </div>

      <!-- Buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <button
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="onClose"
        >
          Cancel
        </button>

        <button
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          :disabled="signing"
          @click="submitSignature"
        >
          {{ signing ? "Processing…" : "Sign & Approve" }}
        </button>
      </div>
    </div>
  </div>
</template>
