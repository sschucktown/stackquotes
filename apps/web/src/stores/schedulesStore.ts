import { defineStore } from "pinia";
import { reactive } from "vue";

type ScheduleStatus = "proposed";

export type ScheduleEntry = {
  startDate: string;
  depositDue: number;
  notes: string;
  status: ScheduleStatus;
};

export const useSchedulesStore = defineStore("schedulesStore", () => {
  const byJobId = reactive<Record<string, ScheduleEntry>>({});

  const setSchedule = (jobId: string, payload: Omit<ScheduleEntry, "status"> & { status?: ScheduleStatus }) => {
    byJobId[jobId] = {
      status: payload.status || "proposed",
      startDate: payload.startDate,
      depositDue: payload.depositDue,
      notes: payload.notes || "",
    };
  };

  const getSchedule = (jobId: string) => byJobId[jobId];

  const clear = () => {
    Object.keys(byJobId).forEach((key) => delete byJobId[key]);
  };

  return {
    byJobId,
    setSchedule,
    getSchedule,
    clear,
  };
});
