import { computed, ComputedRef, Ref } from "vue";

export function useContentLength(content: Ref<string>): {
    chars: ComputedRef<number>;
} {
    const chars = computed(() => {
        return content.value.length;
    });

    return { chars };
}
