import { useInputAction } from "./interactions/useInputAction";
import { useButtonAction } from "./interactions/useButtonAction";
import { useConsentAction } from "./interactions/useConsentAction";
import { useTextareaAction } from "./interactions/useTextareaAction";
import { useRangeAction } from "./interactions/useRangeAction";
import { useDateAction } from "./interactions/useDateAction";
import { useFileAction } from "./interactions/useFileAction";

export type ActionValidatorType =
    | ((input: any) =>
          | {
                valid: any;
                message: string;
            }
          | {
                valid: boolean;
                message?: undefined;
            })
    | undefined;

export function useActions(block: PublicFormBlockModel): {
    actionValidator: ActionValidatorType;
    actionComponent: any;
    actionProps: any;
} {
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
