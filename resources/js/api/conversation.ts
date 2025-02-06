import { AxiosProgressEvent, AxiosResponse } from "axios";
import handler from "./handler";
import { useRoutes } from "@/utils/useRoutes";

export async function callGetForm(
    uuid: string,
): Promise<AxiosResponse<PublicFormModel>> {
    try {
        const { route } = await useRoutes();

        const resolvedRoute = route("api.public.forms.show", {
            uuid,
        });

        if (resolvedRoute) {
            const response = await handler.get(resolvedRoute);
            return Promise.resolve(response as AxiosResponse<PublicFormModel>);
        } else {
            return Promise.reject("route not found");
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function callGetFormStoryboard(
    uuid: string,
): Promise<AxiosResponse<FormStoryboard>> {
    try {
        const { route } = await useRoutes();

        const resolvedRoute = route("api.public.forms.storyboard", {
            uuid,
        });

        if (resolvedRoute) {
            const response = await handler.get(resolvedRoute);
            return Promise.resolve(response as AxiosResponse<FormStoryboard>);
        } else {
            return Promise.reject("route not found");
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function callCreateFormSession(
    uuid: string,
    params: Record<string, string>,
): Promise<AxiosResponse<FormSessionModel>> {
    try {
        const { route } = await useRoutes();

        const resolvedRoute = route("api.public.forms.session.create", {
            uuid,
        });

        if (resolvedRoute) {
            const response = await handler.post(resolvedRoute, {
                params,
            });
            return Promise.resolve(response as AxiosResponse<FormSessionModel>);
        } else {
            return Promise.reject("route not found");
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function callSubmitForm(
    uuid: string,
    token: string,
    payload: FormSubmitPayload | null,
    is_uploading: boolean = false,
): Promise<AxiosResponse<null>> {
    try {
        const { route } = await useRoutes();

        const resolvedRoute = route("api.public.forms.submit", {
            uuid,
        });

        if (resolvedRoute) {
            const response = await handler.post(resolvedRoute, {
                token,
                payload,
                is_uploading,
            });
            return Promise.resolve(response as AxiosResponse<null>);
        } else {
            return Promise.reject("route not found");
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function callUploadFiles(
    uuid: string,
    token: string,
    payload: FormSubmitPayload,
    progressCallback: (file, axiosProgressEvent: AxiosProgressEvent) => void,
): Promise<AxiosResponse[]> {
    const { route } = await useRoutes();

    const resolvedRoute = route("api.public.forms.file-upload", {
        uuid,
    });

    if (!resolvedRoute) {
        return Promise.reject("route not found");
    }

    const requests: Promise<AxiosResponse>[] = [];

    Object.values(payload).forEach((value) => {
        if (Array.isArray(value)) {
            return;
        }

        value.payload.forEach((file: any, index: number) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("token", token);
            formData.append("actionId", value.actionId);

            requests.push(
                handler.post(resolvedRoute, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        progressCallback(
                            `${value.actionId}[${index}]`,
                            progressEvent,
                        );
                    },
                }),
            );
        });
    });

    return await Promise.all(requests);
}
