import { useEventListener } from "@vueuse/core";
import { useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";

// a reload or a closed tab within the save's debounce would drop the change
export function useSaveOnLeave(): void {
    const notice = useNotice();
    const workbench = useWorkbench();

    useEventListener(window, "pagehide", () => workbench.flushSaves());

    useEventListener(window, "beforeunload", (event: BeforeUnloadEvent) => {
        workbench.flushSaves();

        if (notice.saveStatus !== "idle") {
            // the browser asks before leaving; returnValue for older browsers
            event.preventDefault();
            event.returnValue = true;
        }
    });
}
