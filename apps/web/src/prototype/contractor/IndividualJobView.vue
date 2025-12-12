<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import PaymentActivity from "./PaymentActivity.vue";
import FullMessagingInbox from "./FullMessagingInbox.vue";
import FilesManager from "./FilesManager.vue";
import SettingsDrawer from "@/components/Settings/SettingsDrawer.vue";

import { messageStore } from "@/prototype/stores/messages";
import { jobLevelFiles, setFileContext } from "@/prototype/stores/files";
import { timelineEvents } from "./usePrototypeEvents";

/* ----------------------------------
   Types
---------------------------------- */
type JobStatus = "pending" | "scheduled" | "ready" | "in_progress" | "complete";

type Job = {
  id: string;
  proposal_id: string;
  contractor_id: string;
  client_id: string;
  approved_option: string;
  approved_price: number;
  deposit_amount: number | null;
  status: JobStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  approved_at: string | null;
  created_at: string;
};

/* ----------------------------------
   Router / State
---------------------------------- */
const router = useRouter();
const route = useRoute();

const job = ref<Job | null>(null);
const loading = ref(false);
const error = ref(false);

const showSettings = ref(false);
const showPayments = ref(false);
const showInbox = ref(false);
const showFilesManager = ref(false);

/* ----------------------------------
   Job ID Resolution
---------------------------------- */
const jobId = computed(() => {
  const val = route.query.job;
  return typeof val === "string" ? val : "";
});

/* ----------------------------------
   Fetch Job
---------------------------------- */
const fetchJob = async (id: string) => {
  loading.value = true;
  error.value = false;
  job.value = null;

  try {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) throw new Error("Failed to load job");

    const json = await res.json();
    job.value = json.job;
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

watch(
  jobId,
  (id) => {
    if (!id) {
      error.value = true;
      return;
    }
    fetchJob(id);
  },
  { immediate: true }
);

/* ----------------------------------
   Computed Helpers
---------------------------------- */
const statusLabel = computed(() => {
  if (!job.value) return "";
  if (job.value.status === "in_progress") return "In Progress";
  return job.value.status.charAt(0).toUpperCase() + job.value.status.slice(1);
});

const remainingBalance = computed(() => {
  if (!job.value) return 0;
  return job.value.approved_price - (job.value.deposit_amount ?? 0);
});

/* ----------------------------------
   Prototype Sections (Still Mocked)
---------------------------------- */
const tasks = [
  "Perform site measurements",
  "Photograph existing deck",
  "Identify hazards or obstructions",
];

const previewFiles = computed(() => jobLevelFiles.value.slice(0, 4));
const previewEvents = computed(() => timelineEvents.value.slice(0, 3));
const previewMessages = computed(() =>
  messageStore.threads.slice(0, 3).map((thread) => ({
    name: thread.participant,
    project: thread.project,
    preview: thread.lastMessage,
    time: thread.lastMessageTime,
    threadId: thread.id,
    unread: thread.unread,
  }))
);

/* ----------------------------------
   Actions
---------------------------------- */
function openPayments() {
  showPayments.value = true;
}

function openInbox() {
  router.push({ path: "/prototype/contractor/messages" });
}

function openFiles() {
  setFileContext(job.value?.id || "", null);
  showFilesManager.value = true;
}

function openThread(id: string) {
  messageStore.markThreadRead(id);
  router.push({ path: "/prototype/contractor/messages", query: { threadId: id } });
}
</script>
