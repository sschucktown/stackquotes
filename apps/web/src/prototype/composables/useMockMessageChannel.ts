import { onBeforeUnmount, onMounted, ref } from "vue";
import { messageStore } from "@/prototype/stores/messages";

export function useMockMessageChannel(opts: { auto?: boolean } = { auto: false }) {
  const isRunning = ref(false);
  let timer: number | null = null;

  const start = () => {
    if (isRunning.value) return;
    isRunning.value = true;
    timer = window.setInterval(() => {
      messageStore.simulateRandomIncoming();
    }, 25_000);
  };

  const stop = () => {
    isRunning.value = false;
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  onMounted(() => {
    if (opts.auto) start();
  });

  onBeforeUnmount(stop);

  return { isRunning, start, stop };
}
