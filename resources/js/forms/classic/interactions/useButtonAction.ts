import ButtonAction from "@/forms/classic/interactions/ButtonAction.vue";

export function useButtonAction(block: PublicFormBlockModel) {
    const useThis = ["radio", "checkbox"].includes(block.type);

    const validator = (input: any) => {
        const validationMessage = "Please select an option.";

        if (block.is_required) {
            if (!input) {
                return {
                    message: validationMessage,
                    valid: false,
                };
            }

            if (Array.isArray(input)) {
                return {
                    message: validationMessage,
                    valid: input.length > 0,
                };
            }

            return {
                valid: input?.payload && input.actionId,
                message: validationMessage,
            };
        }

        return {
            valid: true,
        };
    };

    return { useThis, component: ButtonAction, validator, props: {} };
}
