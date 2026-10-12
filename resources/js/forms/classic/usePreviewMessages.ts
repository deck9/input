import { watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { useConversation } from "@/stores/conversation";

// messages between the editor and the form in its preview frame, both on the same origin
export type PreviewMessage =
    // the form shows this question
    | { type: "input:preview:block"; block: string }
    // the editor asks for this question
    | { type: "input:preview:goto"; block: string };

export function usePreviewMessages() {
    const store = useConversation();
    const origin = window.location.origin;

    watch(
        () => store.current,
        (block) => {
            if (block) {
                const message: PreviewMessage = {
                    type: "input:preview:block",
                    block,
                };
                window.parent.postMessage(message, origin);
            }
        },
        { immediate: true },
    );

    useEventListener(window, "message", (event: MessageEvent) => {
        if (
            event.origin !== origin ||
            event.source !== window.parent ||
            event.data?.type !== "input:preview:goto" ||
            typeof event.data.block !== "string"
        ) {
            return;
        }

        store.startAt(event.data.block);
    });
}
