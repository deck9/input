import { useInputAction } from "./interactions/useInputAction";
import { useButtonAction } from "./interactions/useButtonAction";
import { computed, ref } from "vue";

export function useActions(block: PublicFormBlockModel) {
    const actionTypes = [useButtonAction(block), useInputAction(block)];

    // just return the component that is requested base on type
    const actionComponent = actionTypes.find((item) => item.useThis);

    const response = ref<string | undefined>(undefined);
    const isValid = computed(() => {
        return (
            (response.value && response.value.length > 0) ||
            block.type === "none"
        );
    });

    return {
        actionComponent: actionComponent?.component,
        response,
        isValid,
    };
}
