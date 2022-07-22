import { useInputAction } from "./interactions/useInputAction";
import { useButtonAction } from "./interactions/useButtonAction";
import { useTextareaAction } from "./interactions/useTextareaAction";

export function useActions(block: PublicFormBlockModel) {
    const actionTypes = [
        useButtonAction(block),
        useInputAction(block),
        useTextareaAction(block),
    ];

    // return the component which is required based on type
    const actionComponent = actionTypes.find((item) => item.useThis);

    return {
        actionComponent: actionComponent?.component,
        actionValidator: actionComponent?.validator,
        actionProps: actionComponent?.props,
    };
}
