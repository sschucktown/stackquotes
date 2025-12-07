import { ref } from "vue";

const settingsState = {
  jobModeAutoOpen: ref(false),
  liveMessageSync: ref(false),
  paymentPreview: ref(false),
  notifyMessages: ref(false),
  notifyPayments: ref(false),
  notifyJobUpdates: ref(false),
  schedulingWindow: ref("9 AM – 5 PM"),
};

export const usePrototypeSettings = () => settingsState;
