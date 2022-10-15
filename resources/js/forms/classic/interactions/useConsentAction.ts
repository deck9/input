import ButtonAction from "@/forms/classic/interactions/ConsentAction.vue";
import { useI18n } from "vue-i18n";

export function useConsentAction(block: PublicFormBlockModel) {
    const { t } = useI18n();
    const useThis = ["consent"].includes(block.type);

    const validator = (input: any) => {
        const validationMessage = t("validation.consent_required");

        // get all required interactions
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

        if (block.is_required) {
            if (!input) {
                isValid = false;
            } else if (input.length === 0) {
                isValid = false;
            }
        }

        return {
            message: validationMessage,
            valid: isValid,
        };
    };

    return { useThis, component: ButtonAction, validator, props: {} };
}
