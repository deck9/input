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

export function callUploadAvatar(
    form: FormModel,
    file: File
): Promise<AxiosResponse<FormModel>> {
    const requestData = new FormData();
    requestData.append("image", file);

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

export function callDeleteAvatar(
    form: FormModel
): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.delete(
                window.route("api.forms.images.delete", { uuid: form.uuid })
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
    AxiosResponse<{ mapping: Record<string, string> }>
> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.form-blocks.mapping")
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
