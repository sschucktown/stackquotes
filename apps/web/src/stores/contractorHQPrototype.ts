import { defineStore } from "pinia";
import { reactive } from "vue";
import { messageStore } from "@/prototype/stores/messages";
import { timelineEvents } from "@/prototype/contractor/usePrototypeEvents";

type JobStatus = "In Progress" | "Scheduled" | "Pending" | "Needs Visit";

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`);

const baseTimeline = () => [...timelineEvents.value];

export const useContractorHQPrototype = defineStore("contractorHQPrototype", {
  state: () =>
    reactive({
      hqAlerts: [] as { id: string; text: string }[],
      jobs: [
        {
          id: "job-maple",
          name: "Maple St Deck",
          type: "Deck",
          status: "Needs Visit" as JobStatus,
          detail: "Site Visit at 3PM",
          lead: "Sarah Thompson",
          location: "482 Maple St, Seattle, WA",
          proposalDraft: null as null | any,
          timeline: baseTimeline(),
        },
        {
          id: "job-lakeview",
          name: "Lakeview Patio Build",
          type: "Patio",
          status: "In Progress" as JobStatus,
          detail: "Active crew on-site",
          lead: "Mike Robertson",
          location: "91 Lakeview Dr, Seattle, WA",
          proposalDraft: null as null | any,
          timeline: baseTimeline(),
        },
        {
          id: "job-baker",
          name: "Baker Ave Fence",
          type: "Fence",
          status: "Pending" as JobStatus,
          detail: "Proposal Follow-Up",
          lead: "Julia Perez",
          location: "219 Baker Ave, Seattle, WA",
          proposalDraft: null as null | any,
          timeline: baseTimeline(),
        },
      ],
    }),

  actions: {
    getJob(jobId?: string) {
      if (!jobId) return this.jobs[0];
      return this.jobs.find((j) => j.id === jobId) || this.jobs[0];
    },
    attachProposalDraft(jobId: string, draft: any) {
      const job = this.jobs.find((j) => j.id === jobId);
      if (job) {
        job.proposalDraft = draft;
      }
    },
    addTimelineEvent(jobId: string, text: string) {
      const job = this.jobs.find((j) => j.id === jobId);
      if (!job) return;
      const event = {
        id: uid(),
        type: "status",
        title: text,
        description: text,
        time: "Just now",
      };
      job.timeline.unshift(event);
      timelineEvents.value.unshift(event);
    },
    addSystemMessage(jobId: string, message: string) {
      const job = this.jobs.find((j) => j.id === jobId);
      const jobName = job?.name ?? "Job";
      const threadId = `system-${jobId}`;

      const existing = messageStore.threads.find((t) => t.id === threadId);
      if (existing) {
        existing.messages.push({
          id: uid(),
          sender: "team",
          text: message,
          time: "Just now",
          unread: true,
        });
        existing.lastMessage = message;
        existing.lastMessageTime = "Just now";
        existing.unread = true;
      } else {
        messageStore.threads.unshift({
          id: threadId,
          jobId,
          participant: "System",
          initials: "SYS",
          project: jobName,
          jobType: job?.type ?? "Job",
          unread: true,
          lastMessage: message,
          lastMessageTime: "Just now",
          messages: [
            {
              id: uid(),
              sender: "team",
              text: message,
              time: "Just now",
              unread: true,
            },
          ],
        });
      }
    },
    addHQAlert(text: string) {
      this.hqAlerts.push({
        id: uid(),
        text,
      });
    },
    addProposalApprovalEvent(jobId: string, option: string) {
      const job = this.jobs.find((j) => j.id === jobId) || this.jobs[0];
      const jobName = job?.name ?? "Job";
      const optionText = option ? option.charAt(0).toUpperCase() + option.slice(1) : "Selected";
      const timelineText = `Client approved the ${optionText} option.`;
      this.addTimelineEvent(job.id, timelineText);
      this.addSystemMessage(job.id, timelineText);
      this.addHQAlert(`Proposal approved for ${jobName}.`);
    },
  },
});
