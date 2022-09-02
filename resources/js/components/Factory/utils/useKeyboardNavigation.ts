import { Ref, ref } from "vue";

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
    const focusNeighborItem = (fromIndex: number) => {
        if (!currentInteractions.value) {
            return;
        }

        const targetIndex = fromIndex === 0 ? 0 : fromIndex - 1;
        focusNextItemSoft(targetIndex - 1);
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
    };
}
