import { useInputAction } from "./interactions/useInputAction";
import { useButtonAction } from "./interactions/useButtonAction";
import { useConsentAction } from "./interactions/useConsentAction";
import { useTextareaAction } from "./interactions/useTextareaAction";
import { useRangeAction } from "./interactions/useRangeAction";
import { useDateAction } from "./interactions/useDateAction";
import { useFileAction } from "./interactions/useFileAction";

export function useActions(block: PublicFormBlockModel) {
    const actionTypes = [
        useButtonAction(block),
        useConsentAction(block),
        useInputAction(block),
        useTextareaAction(block),
        useRangeAction(block),
        useDateAction(block),
        useFileAction(block),
    ];

    // return the component which is required based on type
    const actionComponent = actionTypes.find((item) => item.useThis);

    return {
        actionComponent: actionComponent?.component,
        actionValidator: actionComponent?.validator,
        actionProps: actionComponent?.props,
    };
}
