<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

/* --------------------------------------------------
   Props
-------------------------------------------------- */
const props = defineProps<{
  open: boolean;
  proposalId: string;
  onClose: () => void;
  onSuccess: () => void;
}>();

/* --------------------------------------------------
   State
-------------------------------------------------- */
const signing = ref(false);
const signatureData = ref<string | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let drawing = false;
let lastX = 0;
let lastY = 0;

/* --------------------------------------------------
   Canvas Setup
-------------------------------------------------- */
const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  ctx = context;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#111827";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  signatureData.value = null;
};

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick();
      initCanvas();
    }
  }
);

onMounted(() => {
  if (props.open) nextTick().then(initCanvas);
});

/* --------------------------------------------------
   Drawing Logic
-------------------------------------------------- */
const getPos = (e: MouseEvent | TouchEvent) => {
  const canvas = canvasRef.value!;
  const rect = canvas.getBoundingClientRect();

  if (e instanceof TouchEvent) {
    const t = e.touches[0] || e.changedTouches[0];
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

const startDraw = (e: MouseEvent | TouchEvent) => {
  if (!ctx) return;
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
  if (!canvasRef.value) return;
  drawing = false;
  signatureData.value = canvasRef.value.toDataURL("image/png");
};

/* --------------------------------------------------
   Submit Signature ONLY
-------------------------------------------------- */
const submitSignature = async () => {
  if (!signatureData.value) {
    alert("Please sign before submitting.");
    return;
  }

  signing.value = true;

  try {
    const res = await fetch(
      `/api/smartproposals/${props.proposalId}/sign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature_image: signatureData.value,
        }),
      }
    );

    if (!res.ok) {
      console.error(await res.text());
      alert("Failed to save signature.");
      return;
    }

    props.onSuccess();
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
        />
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="rounded-lg border px-4 py-2 text-sm"
          @click="onClose"
        >
          Cancel
        </button>

        <button
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          :disabled="signing"
          @click="submitSignature"
        >
          {{ signing ? "Processing…" : "Sign & Approve" }}
        </button>
      </div>
    </div>
  </div>
</template>
