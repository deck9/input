import ButtonAction from "@/forms/classic/interactions/ButtonAction.vue";
import { useI18n } from "vue-i18n";

export function useButtonAction(block: PublicFormBlockModel) {
    const { t } = useI18n();
    const useThis = ["radio", "checkbox"].includes(block.type);

    const validator = (input: any) => {
        const validationMessage = t("validation.option_required");

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
