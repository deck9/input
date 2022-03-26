import { useInputAction } from "./interactions/useInputAction";
import { useButtonAction } from "./interactions/useButtonAction";

export function useActions(block: PublicFormBlockModel) {
    const actionTypes = [useButtonAction(block), useInputAction(block)];

    // return the component which is required based on type
    const actionComponent = actionTypes.find((item) => item.useThis);

    return {
        actionComponent: actionComponent?.component,
        actionValidator: actionComponent?.validator,
    };
}
