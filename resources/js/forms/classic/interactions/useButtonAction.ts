import ButtonAction from "@/forms/classic/interactions/ButtonAction.vue";

export function useButtonAction(block: PublicFormBlockModel) {
    const useThis = ["radio", "checkbox"].includes(block.type);

    const validator = (input: any) => {
        if (!input) {
            return false;
        }

        if (Array.isArray(input)) {
            return input.length > 0;
        }

        return input.payload && input.actionId;
    };

    return { useThis, component: ButtonAction, validator };
}
