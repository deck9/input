import InputAction from "@/forms/classic/interactions/InputAction.vue";
import { string, number } from "yup";
import { useI18n } from "vue-i18n";

export function useInputAction(block: PublicFormBlockModel) {
    const { t } = useI18n();
    const useThis = [
        "input-short",
        "input-email",
        "input-number",
        "input-link",
        "input-phone",
        "input-secret",
    ].includes(block.type);

    const validator = (input: any) => {
        const defaultValidator = string().max(100).required();
        const emailValidator = string().max(100).required().email();
        const linkValidator = string().max(100).required().url();
        const numberValidator = number().max(100).required();
        const phoneValidator = string()
            .required()
            .min(7)
            .max(100)
            .matches(/^[+]?(?:[0-9]+[\s-]?[0-9]+)+$/);

        switch (block.type) {
            case "input-email":
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        emailValidator.isValidSync(input?.payload),
                    message: t("validation.valid_email"),
                };
            case "input-number":
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        numberValidator.isValidSync(input?.payload),
                    message: t("validation.valid_number"),
                };
            case "input-link":
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        linkValidator.isValidSync(input?.payload),
                    message: t("validation.valid_link"),
                };
            case "input-phone":
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        phoneValidator.isValidSync(input?.payload),
                    message: t("validation.valid_phone")
                };
            default:
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        defaultValidator.isValidSync(input?.payload),
                    message: t("validation.field_required"),
                };
        }
    };

    return { useThis, component: InputAction, validator, props: {} };
}
