/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";
import { useRoutes } from "@/utils/useRoutes";

export function callGetForm(
    uuid: string
): Promise<AxiosResponse<PublicFormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

            const resolvedRoute = route("api.public.forms.show", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.get(resolvedRoute);
                resolve(response as AxiosResponse<PublicFormModel>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callGetFormStoryboard(
    uuid: string
): Promise<AxiosResponse<FormStoryboard>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

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

export function callCreateFormSession(
    uuid: string,
    params: Record<string, string>
): Promise<AxiosResponse<FormSessionModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

            const resolvedRoute = route("api.public.forms.session.create", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.post(resolvedRoute, {
                    params,
                });
                resolve(response as AxiosResponse<FormSessionModel>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callSubmitForm(
    uuid: string,
    token: string,
    payload: FormSubmitPayload
): Promise<AxiosResponse<null>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

            const resolvedRoute = route("api.public.forms.submit", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.post(resolvedRoute, {
                    token,
                    payload,
                });
                resolve(response as AxiosResponse<null>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}
