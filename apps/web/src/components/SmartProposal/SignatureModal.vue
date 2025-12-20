<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

/* --------------------------------------------------
   Props
-------------------------------------------------- */
const props = defineProps<{
  open: boolean;
  publicToken: string;
  acceptedOption: string;
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

  ctx = canvas.getContext("2d");
  if (!ctx) return;

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
   Drawing
-------------------------------------------------- */
const getPos = (e: MouseEvent | TouchEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect();
  const t =
    e instanceof TouchEvent ? e.touches[0] || e.changedTouches[0] : e;

  return {
    x: t.clientX - rect.left,
    y: t.clientY - rect.top,
  };
};

const startDraw = (e: MouseEvent | TouchEvent) => {
  if (!ctx) return;
  drawing = true;
  Object.assign({ lastX, lastY }, getPos(e));
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
  signatureData.value = canvasRef.value!.toDataURL("image/png");
};

/* --------------------------------------------------
   Submit Signature
-------------------------------------------------- */
const submitSignature = async () => {
  if (!signatureData.value) {
    alert("Please sign first.");
    return;
  }

  signing.value = true;

  try {
    const res = await fetch(
      `/api/share/proposal/${props.publicToken}/sign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepted_option: props.acceptedOption,
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
      <h2 class="text-lg font-semibold">Sign to Approve</h2>

      <div class="mt-4 rounded-xl border bg-slate-50 p-3">
        <canvas
          ref="canvasRef"
          width="500"
          height="200"
          class="w-full rounded bg-white"
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
        <button class="border px-4 py-2 text-sm" @click="onClose">
          Cancel
        </button>

        <button
          class="bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          :disabled="signing"
          @click="submitSignature"
        >
          {{ signing ? "Processing…" : "Sign & Approve" }}
        </button>
      </div>
    </div>
  </div>
</template>
