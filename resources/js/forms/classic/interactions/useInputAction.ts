import InputAction from "@/forms/classic/interactions/InputAction.vue";
import { string, number } from "yup";

export function useInputAction(block: PublicFormBlockModel) {
    const useThis = [
        "input-short",
        "input-email",
        "input-number",
        "input-link",
        "input-phone",
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
                    valid: emailValidator.isValidSync(input?.payload),
                    message: "Please enter a valid email.",
                };
            case "input-number":
                return {
                    valid: numberValidator.isValidSync(input?.payload),
                    message: "Please enter a valid number.",
                };
            case "input-link":
                return {
                    valid: linkValidator.isValidSync(input?.payload),
                    message: "Please enter a valid link.",
                };
            case "input-phone":
                return {
                    valid: phoneValidator.isValidSync(input?.payload),
                    message: "Please enter a valid phone number.",
                };
            default:
                return { valid: true, message: "" };
        }
    };

    return { useThis, component: InputAction, validator, props: {} };
}
