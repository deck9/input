/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callCreateForm(): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.create")
            );

            resolve(response as AxiosResponse<FormModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callGetForm(
    form: FormModel
): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.forms.show", { uuid: form.uuid })
            );

            resolve(response as AxiosResponse<FormModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateForm(
    form: FormModel
): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.update", { uuid: form.uuid }),
                form
            );

            resolve(response as AxiosResponse<FormModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteForm(form: FormModel): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.delete(
                window.route("api.forms.update", { uuid: form.uuid })
            );

            resolve(response.status === 200);
        } catch (error) {
            reject(error);
        }
    });
}

export function callPublishForm(
    form: FormModel
): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.publish", { uuid: form.uuid })
            );

            if (response.status === 200) {
                resolve(response as AxiosResponse<FormModel>);
            } else {
                reject(false);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callUnpublishForm(
    form: FormModel
): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.unpublish", { uuid: form.uuid })
            );

            if (response.status === 200) {
                resolve(response as AxiosResponse<FormModel>);
            } else {
                reject(false);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callUploadFormImage(
    form: FormModel,
    file: File,
    type: ImageType
): Promise<AxiosResponse<FormModel>> {
    const requestData = new FormData();
    requestData.append("image", file);
    requestData.append("type", type);

    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.images.store", { uuid: form.uuid }),
                requestData
            );
            if (response.status === 201) {
                resolve(response as AxiosResponse<FormModel>);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteFormImage(
    form: FormModel,
    type: ImageType
): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.delete(
                window.route("api.forms.images.delete", { uuid: form.uuid }),
                { data: { type } }
            );
            if (response.status === 200) {
                resolve(response as AxiosResponse<FormModel>);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callGetFormBlockMapping(): Promise<
    AxiosResponse<{ mapping: Record<FormBlockType, FormBlockInteractionType> }>
> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.form-blocks.mapping")
            );
            if (response.status === 200) {
                resolve(
                    response as AxiosResponse<{
                        mapping: Record<
                            FormBlockType,
                            FormBlockInteractionType
                        >;
                    }>
                );
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callGetFormTemplate(
    form
): Promise<AxiosResponse<{ mapping: Record<string, string> }>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.forms.template-export", { form: form })
            );
            if (response.status === 200) {
                resolve(
                    response as AxiosResponse<{
                        mapping: Record<string, string>;
                    }>
                );
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callImportFormTemplate(
    form,
    template: string | File
): Promise<AxiosResponse<{ mapping: Record<string, string> }>> {
    return new Promise(async (resolve, reject) => {
        try {
            let requestData;

            if (typeof template === "string") {
                requestData = { template };
            } else {
                requestData = new FormData();
                requestData.append("file", template);
            }

            const response = await handler.post(
                window.route("api.forms.template-import", { form: form }),
                requestData
            );
            if (response.status === 200) {
                resolve(
                    response as AxiosResponse<{
                        mapping: Record<string, string>;
                    }>
                );
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callGetFormSubmissions(
    form: FormModel,
    page = 1
): Promise<PaginatedResponse<Record<string, any>>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.forms.submissions", { form: form.uuid }),
                {
                    params: {
                        page,
                    },
                }
            );

            if (response.status === 200) {
                resolve(
                    response.data as PaginatedResponse<Record<string, any>>
                );
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callPurgeSubmissions(form: FormModel): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.purge-results", { uuid: form.uuid })
            );
            if (response.status === 204) {
                resolve(response as AxiosResponse);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteFormSubmission(
    form: FormModel,
    session: FormSessionModel
): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.delete(
                window.route("api.forms.submissions.delete", {
                    form: form.uuid,
                    session: session.id,
                })
            );
            if (response.status === 204) {
                resolve(response as AxiosResponse);
            }
        } catch (error) {
            reject(error);
        }
    });
}
