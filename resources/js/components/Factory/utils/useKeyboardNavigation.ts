import { nextTick, Ref, ref } from "vue";

export function useKeyboardNavigation(
    currentInteractions,
    onNoItemFound: () => void
) {
    const traversables = ref({}) as unknown as Ref<
        Record<number, { item: any; focus: any }>
    >;

    const bindTemplateRefsForTraversables = (el) => {
        if (el && el.item) {
            traversables.value[el.item.id] = el;
        }
    };

    const focusNextItemSoft = (fromIndex: number) => {
        focusNextItem(fromIndex, false);
    };

    // choose a next item
    // once the row at fromIndex is gone: focus the row before it, or the
    // new first row. False when no row is left.
    const focusNeighborItem = async (fromIndex: number) => {
        await nextTick();

        const destination =
            currentInteractions.value?.[Math.max(fromIndex - 1, 0)];
        traversables.value[destination?.id]?.focus();

        return Boolean(destination);
    };

    const focusNextItem = async (fromIndex: number, create = true) => {
        if (!currentInteractions.value) {
            return;
        }

        // get the next item in order
        const destination = currentInteractions.value[fromIndex + 1];

        // if there is no next item, create new item and call self again
        if (typeof destination === "undefined") {
            if (!create) {
                return;
            }

            onNoItemFound();
        } else {
            // if there is a next item, find it in template refs an focus it
            traversables.value[destination.id].focus();
        }
    };

    const focusPreviousItem = async (fromIndex: number) => {
        if (!currentInteractions.value || fromIndex === 0) {
            return;
        }

        const destination = currentInteractions.value[fromIndex - 1];
        traversables.value[destination.id].focus();
    };

    const focusItem = (item: { id: number }) => {
        traversables.value[item.id]?.focus();
    };

    const focusLastItem = async () => {
        if (!currentInteractions.value) {
            return;
        }

        const destination =
            currentInteractions.value[currentInteractions.value.length - 1];

        traversables.value[destination.id].focus();
    };

    return {
        bindTemplateRefsForTraversables,
        onNoItemFound,
        focusNextItemSoft,
        focusNeighborItem,
        focusNextItem,
        focusPreviousItem,
        focusLastItem,
        focusItem,
    };
}
