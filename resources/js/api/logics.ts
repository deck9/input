/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callCreateFormBlockLogic(
    id: number,
    attributes?: Partial<FormBlockLogic>,
): Promise<AxiosResponse<FormBlockLogic>> {
    console.log("create logic", id, attributes);

    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.logics.create", { block: id }),
                {
                    ...attributes,
                },
            );

            resolve(response as AxiosResponse<FormBlockLogic>);
        } catch (error) {
            reject(error);
        }
    });
}
