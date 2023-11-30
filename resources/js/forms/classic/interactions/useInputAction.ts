import InputAction from "@/forms/classic/interactions/InputAction.vue";
import { string, number } from "yup";

export function useInputAction(block: PublicFormBlockModel) {
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
                    message: "Please enter a valid email.",
                };
            case "input-number":
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        numberValidator.isValidSync(input?.payload),
                    message: "Please enter a valid number.",
                };
            case "input-link":
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        linkValidator.isValidSync(input?.payload),
                    message: "Please enter a valid link.",
                };
            case "input-phone":
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        phoneValidator.isValidSync(input?.payload),
                    message: "Please enter a valid phone number.",
                };
            default:
                return {
                    valid:
                        (!block.is_required && !input?.payload) ||
                        defaultValidator.isValidSync(input?.payload),
                    message: "Please enter a valid short text.",
                };
        }
    };

    return { useThis, component: InputAction, validator, props: {} };
}
