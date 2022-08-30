import { ref, Ref, watch } from "vue";

export function useBeforeUnload(
    isUnloadActive: Ref<boolean> = ref(true),
    confirmationMessage = "Your changes may not be saved."
): void {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
        // this line is needed for cross browser compatibility
        (event || window.event).returnValue = confirmationMessage;

        return confirmationMessage;
    };

    watch(
        isUnloadActive,
        (isActive: Ref<boolean>) => {
            if (isActive.value) {
                window.addEventListener("beforeunload", onBeforeUnload);
            } else {
                window.removeEventListener("beforeunload", onBeforeUnload);
            }
        },
        { immediate: true }
    );
}
