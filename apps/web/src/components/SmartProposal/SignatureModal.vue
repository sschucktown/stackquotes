<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
  proposalId: string;
  acceptedOption: string;
  approvedPrice: number;
  depositAmount: number | null;
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
// Canvas Setup
// --------------------------------------------------
const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  ctx = context;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#111827";

  // Clear any previous strokes
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  signatureData.value = null;
};

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      initCanvas();
    } else {
      // Reset state when closed
      drawing = false;
    }
  }
);

onMounted(() => {
  if (props.open) {
    nextTick().then(initCanvas);
  }
});

const getPos = (e: MouseEvent | TouchEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  let clientX = 0;
  let clientY = 0;

  if (e instanceof TouchEvent) {
    const t = e.touches[0] || e.changedTouches[0];
    if (!t) return { x: 0, y: 0 };
    clientX = t.clientX;
    clientY = t.clientY;
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
  if (!ctx || !canvasRef.value) return;
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
  if (!canvasRef.value) {
    drawing = false;
    return;
  }
  drawing = false;
  signatureData.value = canvasRef.value.toDataURL("image/png");
};

// --------------------------------------------------
// Submit Signature → SmartProposal + Job
// --------------------------------------------------
const submitSignature = async () => {
  if (!signatureData.value) {
    alert("Please sign before submitting.");
    return;
  }

  signing.value = true;

  try {
    // 1️⃣ Submit signature to SmartProposal
    const signRes = await fetch(`/api/smartproposals/${props.proposalId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accepted_option: props.acceptedOption,
        signature_image: signatureData.value,
      }),
    });

    if (!signRes.ok) {
      console.error(await signRes.text());
      alert("Could not submit signature.");
      signing.value = false;
      return;
    }

    await signRes.json(); // We don’t strictly need payload yet

    // 2️⃣ Create Job with REAL price + deposit
    const jobRes = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposal_id: props.proposalId,
        approved_option: props.acceptedOption,
        approved_price: props.approvedPrice,
        deposit_amount: props.depositAmount,
        // TODO: replace with real client once wired into public proposal view
        client_id: "00000000-0000-0000-0000-000000000000",
      }),
    });

    if (!jobRes.ok) {
      console.error(await jobRes.text());
      alert("Signature saved, but job could not be created.");
      signing.value = false;
      return;
    }

    const jobData = await jobRes.json();

    // Notify parent with new job ID (from API `{ success, job }`)
    props.onSuccess(jobData.job.id);
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

      <!-- Canvas -->
      <div class="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-3">
        <canvas
          ref="canvasRef"
          width="500"
          height="200"
          class="w-full rounded-lg bg-white touch-none"
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
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
          :disabled="signing"
          @click="submitSignature"
        >
          {{ signing ? "Processing…" : "Sign & Approve" }}
        </button>
      </div>
    </div>
  </div>
</template>
