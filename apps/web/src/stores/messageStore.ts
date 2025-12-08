import { defineStore } from "pinia";

type SystemMessagePayload = {
  type: string;
  body: string;
};

type MessageThread = {
  projectId: string;
  messages: SystemMessagePayload[];
};

export const useMessageStore = defineStore("messageStore", {
  state: () => ({
    threads: [] as MessageThread[],
  }),
  actions: {
    addSystemMessage(projectId: string, message: SystemMessagePayload) {
      let thread = this.threads.find((t) => t.projectId === projectId);
      if (!thread) {
        thread = { projectId, messages: [] };
        this.threads.push(thread);
      }
      thread.messages.push(message);
    },
  },
});
