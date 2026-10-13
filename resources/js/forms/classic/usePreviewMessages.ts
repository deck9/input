import { watch } from "vue";
import { onKeyStroke, useEventListener } from "@vueuse/core";
import { useConversation } from "@/stores/conversation";
import { END_SCREEN } from "./previewTarget";

// messages between the editor and the form in its preview frame, both on the same origin;
// a block is a question's uuid or END_SCREEN
export type PreviewMessage =
    // the form shows this question
    | { type: "input:preview:block"; block: string }
    // the editor asks for this question
    | { type: "input:preview:goto"; block: string }
    // Esc goes to the frame, so the editor's panel around it gets it this way
    | { type: "input:preview:escape" };

export function usePreviewMessages() {
    const store = useConversation();
    const origin = window.location.origin;

    watch(
        () => (store.isSubmitted ? END_SCREEN : store.current),
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

    onKeyStroke("Escape", () => {
        const message: PreviewMessage = { type: "input:preview:escape" };
        window.parent.postMessage(message, origin);
    });

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
