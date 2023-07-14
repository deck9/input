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
        const emailValidator = string().required().email();
        const linkValidator = string().required().url();
        const numberValidator = number().required();
        const phoneValidator = string()
            .required()
            .min(7)
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
                    valid: block.is_required ? input?.payload.length > 0 : true,
                    message: "This field is required",
                };
        }
    };

    return { useThis, component: InputAction, validator, props: {} };
}
