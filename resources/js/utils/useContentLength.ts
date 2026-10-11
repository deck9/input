import { computed, ComputedRef, Ref } from "vue";

export function useContentLength(content: Ref<string>): {
    chars: ComputedRef<number>;
    words: ComputedRef<number>;
} {
    const chars = computed(() => {
        return content.value.length;
    });

    const words = computed(() => {
        return content.value.split(/\s+/).filter(Boolean).length;
    });

    return { chars, words };
}
