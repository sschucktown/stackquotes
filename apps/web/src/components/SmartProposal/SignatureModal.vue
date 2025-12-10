<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
  proposalId: string;
  acceptedOption: string;
  onClose: () => void;
  onSuccess: (payload: { proposalId: string; jobId?: string | null }) => void;
}>();

const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);
const signerName = ref("");

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let drawing = false;

const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }
};

const clearCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, rect.width, rect.height);
};

const getPos = (evt: MouseEvent | TouchEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  if (evt instanceof MouseEvent) {
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }
  const touch = evt.touches[0] || evt.changedTouches[0];
  return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
};

const handlePointerDown = (evt: MouseEvent | TouchEvent) => {
  if (!ctx) return;
  drawing = true;
  const { x, y } = getPos(evt);
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const handlePointerMove = (evt: MouseEvent | TouchEvent) => {
  if (!drawing || !ctx) return;
  const { x, y } = getPos(evt);
  ctx.lineTo(x, y);
  ctx.stroke();
};

const handlePointerUp = () => {
  drawing = false;
};

onMounted(() => {
  if (props.open) {
    requestAnimationFrame(initCanvas);
  }
  window.addEventListener("mouseup", handlePointerUp);
  window.addEventListener("touchend", handlePointerUp);
});

onUnmounted(() => {
  window.removeEventListener("mouseup", handlePointerUp);
  window.removeEventListener("touchend", handlePointerUp);
});

watch(
  () => props.open,
  (open) => {
    if (open) {
      errorMessage.value = null;
      signerName.value = "";
      requestAnimationFrame(() => {
        initCanvas();
      });
    }
  }
);

const handleSubmit = async () => {
  if (!props.acceptedOption) {
    errorMessage.value = "Please select an option before signing.";
    return;
  }

  const canvas = canvasRef.value;
  if (!canvas) return;

  const dataUrl = canvas.toDataURL("image/png");
  if (!dataUrl || dataUrl === "data:,") {
    errorMessage.value = "Please add your signature in the box.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    const res = await fetch(
      `/api/smartproposals/${encodeURIComponent(props.proposalId)}/sign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accepted_option: props.acceptedOption,
          signature_image: dataUrl,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Unable to save signature. Please try again.");
    }

    const json = await res.json();
    const proposalId = json.proposalId || props.proposalId;
    const jobId = json.job_id ?? null;

    props.onSuccess({ proposalId, jobId });
  } catch (err: any) {
    errorMessage.value = err?.message || "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div
        class="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        @click.stop
      >
        <header class="mb-4 flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Step 2 of 2
            </p>
            <h2 class="text-lg font-semibold text-slate-900">
              Add your signature to approve
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              This confirms which option you’re choosing and lets your contractor move forward.
            </p>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600"
            @click="onClose"
          >
            ✕
          </button>
        </header>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Your name
            </label>
            <input
              v-model="signerName"
              type="text"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Type your full name"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Sign below
            </label>
            <div class="rounded-xl border border-slate-300 bg-slate-50/60 p-3">
              <canvas
                ref="canvasRef"
                class="h-40 w-full rounded-lg bg-white shadow-inner"
                @mousedown.prevent="handlePointerDown"
                @mousemove.prevent="handlePointerMove"
                @touchstart.prevent="handlePointerDown"
                @touchmove.prevent="handlePointerMove"
              ></canvas>
              <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Use your mouse or finger to sign.</span>
                <button
                  type="button"
                  class="text-xs font-semibold text-slate-600 hover:text-slate-800"
                  @click="clearCanvas"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-rose-600">
            {{ errorMessage }}
          </p>

          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              @click="onClose"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="handleSubmit"
              :disabled="isSubmitting"
            >
              <span v-if="!isSubmitting">Approve &amp; Sign</span>
              <span v-else>Saving…</span>
            </button>
          </div>

          <p class="mt-1 text-[11px] text-slate-500">
            Nothing is final until your contractor confirms everything with you. This signature lets them know which option you’re choosing so they can move to the next step.
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
