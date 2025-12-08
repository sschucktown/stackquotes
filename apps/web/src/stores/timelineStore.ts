import { defineStore } from "pinia";

type TimelineEvent = {
  id: string;
  projectId: string;
  text: string;
  createdAt: string;
};

export const useTimelineStore = defineStore("timelineStore", {
  state: () => ({
    events: [] as TimelineEvent[],
  }),
  actions: {
    addEvent(projectId: string, text: string) {
      const event: TimelineEvent = {
        id: `timeline-${Date.now()}`,
        projectId,
        text,
        createdAt: new Date().toISOString(),
      };
      this.events.unshift(event);
    },
  },
});
