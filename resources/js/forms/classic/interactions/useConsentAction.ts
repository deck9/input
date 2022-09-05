import ButtonAction from "@/forms/classic/interactions/ConsentAction.vue";

export function useConsentAction(block: PublicFormBlockModel) {
    const useThis = ["consent"].includes(block.type);

    const validator = (input: any) => {
        const validationMessage =
            "To continue, you must agree to the terms and conditions.";

        // get all required interacitons
        const required = block.interactions.filter((item) => {
            return item.options?.required;
        });

        let isValid = true;

        if (required.length === 0) {
            isValid = true;
        } else {
            if (!input) {
                isValid = false;
            } else {
                required.forEach((item) => {
                    const found = input.find((input) => {
                        return input.actionId === item.id;
                    });

                    if (!found) {
                        isValid = false;
                    }
                });
            }
        }

        return {
            message: validationMessage,
            valid: isValid,
        };
    };

    return { useThis, component: ButtonAction, validator, props: {} };
}
