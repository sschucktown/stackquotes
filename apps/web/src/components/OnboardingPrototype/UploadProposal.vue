<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:px-8">
      <header class="space-y-3 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Onboarding Prototype</p>
        <h1 class="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          Upload your old proposal — we’ll rebuild it for you.
        </h1>
        <p class="text-sm text-slate-600">
          Drag in anything you have today. We’ll fake the rest so you can feel the finished experience.
        </p>
      </header>

      <div class="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
        <section
          class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur"
        >
          <div
            class="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition"
            :class="isDragging ? 'border-sky-400 bg-sky-50/80' : 'border-slate-300 bg-slate-50'"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
            @click="triggerInput"
          >
            <input
              ref="fileInput"
              type="file"
              class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              @change="onFileChange"
            />
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-inner">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 12-3.5-3.5M12 16l3.5-3.5" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 16.5v1.75A1.75 1.75 0 0 0 7.75 20h8.5A1.75 1.75 0 0 0 18 18.25V16.5"
                />
              </svg>
            </div>
            <div class="space-y-2">
              <p class="text-lg font-semibold text-slate-900">Drop a file or click to upload</p>
              <p class="text-sm text-slate-600">
                PDF, JPG, PNG, DOCX — under 25MB. We’ll pretend to scan it instantly.
              </p>
            </div>
            <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition group-hover:scale-[1.01]">
              <span class="text-sky-600">↥</span>
              <span>Choose a file</span>
            </div>
          </div>

          <transition name="fade">
            <p v-if="error" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {{ error }}
            </p>
          </transition>
        </section>

        <aside class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Step 1</div>
            <div>
              <p class="text-sm font-semibold text-slate-900">Upload</p>
              <p class="text-sm text-slate-600">We stash the filename so the rest of the flow feels real.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="mt-0.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Next</div>
            <div>
              <p class="text-sm font-semibold text-slate-900">Processing</p>
              <p class="text-sm text-slate-600">Watch a quick progress vignette, then confirm your trade.</p>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected file</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">
              {{ selectedFileName }}
            </p>
            <p class="text-xs text-slate-500">Change it anytime — this is a mock store only.</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "docx"];

const isDragging = ref(false);
const error = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFileName = computed(() => store.uploadedFileName || "No file selected yet.");

const triggerInput = () => {
  fileInput.value?.click();
};

const validateFile = (file: File): string | null => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions.includes(ext)) {
    return "Accepted file types: PDF, JPG, PNG, DOCX.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "File must be smaller than 25MB for this demo.";
  }
  return null;
};

const handleFile = (file?: File) => {
  if (!file) return;
  const validationError = validateFile(file);
  if (validationError) {
    error.value = validationError;
    return;
  }
  error.value = "";
  store.setUploadedFileName(file.name);
  router.push("/onboarding/processing");
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0];
  handleFile(file ?? undefined);
  if (target) {
    target.value = "";
  }
};

const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  handleFile(file ?? undefined);
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
