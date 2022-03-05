import { computed, ComputedRef, Ref } from "@vue/runtime-core";

export function useActiveCard(isActive: Ref<boolean>): {
    cardStyle: ComputedRef<string>;
} {
    const cardStyle = computed(() => {
        if (isActive.value === true) {
            return "border-2 border-blue-900 bg-white";
        } else {
            return "border-2 border-grey-200 bg-white hover:border-grey-300";
        }
    });

    return { cardStyle };
}
