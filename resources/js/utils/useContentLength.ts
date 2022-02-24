import { computed, ComputedRef, Ref } from "vue";

export function useContentLength(content: Ref<string>): {
    chars: ComputedRef<number>;
    words: ComputedRef<number>;
} {
    const chars = computed(() => {
        return content.value.length;
    });

    const words = computed(() => {
        if (chars.value === 0) {
            return 0;
        }
        return content.value.trim().split(" ").length;
    });

    return { chars, words };
}
