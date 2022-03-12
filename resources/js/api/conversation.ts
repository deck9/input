/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";
import { useRoutes } from "@/utils/useRoutes";

export function callGetFormStoryboard(
    uuid: string
): Promise<AxiosResponse<FormStoryboard>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = useRoutes();

            const resolvedRoute = route("api.public.forms.storyboard", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.get(resolvedRoute);
                resolve(response as AxiosResponse<FormStoryboard>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}
