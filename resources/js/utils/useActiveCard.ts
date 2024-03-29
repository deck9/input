import { computed, ComputedRef, Ref } from "vue";

export function useActiveCard(isActive: Ref<boolean>): {
    cardStyle: ComputedRef<string>;
} {
    const cardStyle = computed(() => {
        if (isActive.value === true) {
            return "border-2 border-grey-500 bg-white";
        } else {
            return "border-2 border-grey-200 bg-white";
        }
    });

    return { cardStyle };
}
