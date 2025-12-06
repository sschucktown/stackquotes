import { reactive } from "vue";

export type Message = {
  id: string;
  sender: "client" | "contractor" | "team";
  text: string;
  time: string;
  unread: boolean;
  timelineLinked?: boolean;
};

export type Thread = {
  id: string;
  jobId: string;
  participant: string;
  initials: string;
  project: string;
  jobType: string;
  unread: boolean;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
};

export const messageStore = reactive({
  threads: [
    {
      id: "sarah-thompson",
      jobId: "job-maple",
      participant: "Sarah Thompson",
      initials: "ST",
      project: "Maple St Deck",
      jobType: "Deck",
      unread: true,
      lastMessage: "Quick question about materials.",
      lastMessageTime: "2h ago",
      messages: [
        {
          id: "msg-s1",
          sender: "client",
          text: "Hi Jordan, can you confirm the composite color options?",
          time: "9:04 AM",
          unread: true,
          timelineLinked: true
        },
        {
          id: "msg-s2",
          sender: "contractor",
          text: "Yes! We can show you samples during the visit.",
          time: "9:06 AM",
          unread: false
        },
        {
          id: "msg-s3",
          sender: "client",
          text: "Great, thank you!",
          time: "9:09 AM",
          unread: false,
          timelineLinked: true
        }
      ]
    },
    {
      id: "mike-robertson",
      jobId: "job-lakeview",
      participant: "Mike Robertson",
      initials: "MR",
      project: "Lakeview Patio",
      jobType: "Patio",
      unread: false,
      lastMessage: "Did you get the photos?",
      lastMessageTime: "4h ago",
      messages: [
        {
          id: "msg-m1",
          sender: "client",
          text: "Did you get the photos?",
          time: "8:02 AM",
          unread: false,
          timelineLinked: true
        },
        {
          id: "msg-m2",
          sender: "contractor",
          text: "Yes, downloading now. We will add to the file set.",
          time: "8:06 AM",
          unread: false
        }
      ]
    },
    {
      id: "crew-chat",
      jobId: "job-team",
      participant: "Crew Chat",
      initials: "CC",
      project: "Team Thread",
      jobType: "Team",
      unread: false,
      lastMessage: "Material staged by side gate.",
      lastMessageTime: "Yesterday",
      messages: [
        {
          id: "msg-c1",
          sender: "team",
          text: "Material staged by side gate.",
          time: "Yesterday 6:30 PM",
          unread: false,
          timelineLinked: true
        },
        {
          id: "msg-c2",
          sender: "team",
          text: "Need to tarp if rain tonight.",
          time: "Yesterday 6:42 PM",
          unread: false
        }
      ]
    }
  ] as Thread[],

  markThreadRead(id: string) {
    const thread = this.threads.find((t) => t.id === id);
    if (!thread) return;
    thread.unread = false;
    thread.messages.forEach((msg) => {
      msg.unread = false;
    });
  }
});
