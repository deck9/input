/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";
import { useRoutes } from "@/utils/useRoutes";

export function callGetFormStoryboard(
    uuid: string
): Promise<AxiosResponse<any>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = useRoutes();

            console.log(uuid, route("api.form-blocks.mapping"));
            // const response = await handler.post()
            // resolve(response as AxiosResponse<FormBlockInteractionModel>);
        } catch (error) {
            reject(error);
        }
    });
}
