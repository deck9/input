import {
    createSharedComposable,
    useEventListener,
    useIntervalFn,
} from "@vueuse/core";
import { ref } from "vue";

// one clock for all rows: it moves every minute and when the tab comes back into view
export const useNow = createSharedComposable(() => {
    const now = ref(new Date());
    const tick = () => {
        now.value = new Date();
    };

    useIntervalFn(tick, 60 * 1000);
    useEventListener(document, "visibilitychange", () => {
        if (document.visibilityState === "visible") {
            tick();
        }
    });

    return now;
});
