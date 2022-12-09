import RangeAction from "@/forms/classic/interactions/RangeAction.vue";

export function useRangeAction(block: PublicFormBlockModel) {
    const useThis = ["rating", "scale"].includes(block.type);

    const validator = (input: any) => {
        const validationMessage = "Please choose a rating.";

        if (block.is_required) {
            if (!input) {
                return {
                    message: validationMessage,
                    valid: false,
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

    return { useThis, component: RangeAction, validator, props: {} };
}
