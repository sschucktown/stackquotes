import { computed, reactive } from "vue";

export type FileKind = "image" | "document" | "video" | "other";

export type PrototypeFile = {
  id: string;
  jobId: string;
  taskId?: string | null;
  name: string;
  kind: FileKind;
  url: string;
  thumbUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  sizeLabel: string;
  note?: string;
  folder?: string;
};

type State = {
  files: PrototypeFile[];
  selectedJobId: string | null;
  selectedTaskId: string | null;
};

export const filesStore = reactive<State>({
  files: [
    {
      id: "file-1",
      jobId: "maple-st-deck",
      taskId: null,
      name: "Front elevation - before.jpg",
      kind: "image",
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=60",
      uploadedBy: "Jordan",
      uploadedAt: "Today • 9:14 AM",
      sizeLabel: "1.8 MB",
      note: "Taken from street side.",
      folder: "Before Visit",
    },
    {
      id: "file-2",
      jobId: "maple-st-deck",
      taskId: "task-measurements",
      name: "Measurements.pdf",
      kind: "document",
      url: "#",
      uploadedBy: "Jordan",
      uploadedAt: "Yesterday • 4:22 PM",
      sizeLabel: "320 KB",
      folder: "Measurements",
    },
    {
      id: "file-3",
      jobId: "maple-st-deck",
      taskId: null,
      name: "Material palette.png",
      kind: "image",
      url: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=900&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=400&q=60",
      uploadedBy: "Sarah",
      uploadedAt: "Jun 26 • 5:12 PM",
      sizeLabel: "780 KB",
      folder: "Selections",
      note: "Client prefers light cedar tone.",
    },
    {
      id: "file-4",
      jobId: "maple-st-deck",
      taskId: "task-demo",
      name: "Demo walkthrough.mp4",
      kind: "video",
      url: "#",
      uploadedBy: "Crew",
      uploadedAt: "Jun 25 • 11:02 AM",
      sizeLabel: "45 MB",
      folder: "After Demo",
    },
    {
      id: "file-5",
      jobId: "maple-st-deck",
      taskId: "task-footings",
      name: "Footing layout.pdf",
      kind: "document",
      url: "#",
      uploadedBy: "Jordan",
      uploadedAt: "Jun 24 • 2:44 PM",
      sizeLabel: "540 KB",
      folder: "Footings",
      note: "Updated 12\" depth on north side.",
    },
  ],
  selectedJobId: "maple-st-deck",
  selectedTaskId: null,
});

export const jobFiles = computed(() =>
  filesStore.files.filter((f) => f.jobId === filesStore.selectedJobId)
);

export const jobLevelFiles = computed(() =>
  jobFiles.value.filter((f) => !f.taskId)
);

export const taskLevelFiles = computed(() =>
  jobFiles.value.filter((f) => f.taskId === filesStore.selectedTaskId)
);

export function setFileContext(jobId: string, taskId?: string | null) {
  filesStore.selectedJobId = jobId;
  filesStore.selectedTaskId = taskId ?? null;
}

export function addMockFile(file: Partial<PrototypeFile> & { name: string; kind: FileKind }) {
  const id = `file-${Date.now()}`;
  filesStore.files.unshift({
    id,
    jobId: filesStore.selectedJobId ?? "maple-st-deck",
    taskId: filesStore.selectedTaskId,
    url: file.url ?? "#",
    uploadedBy: "You",
    uploadedAt: "Just now",
    sizeLabel: file.sizeLabel ?? "—",
    folder: file.folder,
    note: file.note,
    thumbUrl: file.thumbUrl,
    ...file,
  });
}
