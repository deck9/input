/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callGetformWebhooks(
    form: FormModel
): Promise<AxiosResponse<Array<FormWebhookModel>>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.forms.webhooks.index", {
                    uuid: form.uuid,
                })
            );

            resolve(response as AxiosResponse<Array<FormWebhookModel>>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callCreateformWebhooks(
    form: FormModel,
    webhook: Partial<FormWebhookModel>
): Promise<AxiosResponse<FormWebhookModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.webhooks.create", {
                    uuid: form.uuid,
                }),
                webhook
            );

            resolve(response as AxiosResponse<FormWebhookModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateformWebhooks(
    form: FormModel,
    webhook: FormWebhookModel
): Promise<AxiosResponse<FormWebhookModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.webhooks.update", {
                    form: form.uuid,
                    webhook: webhook.id,
                }),
                webhook
            );

            resolve(response as AxiosResponse<FormWebhookModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteFormIntegration(
    form: FormModel,
    webhook: FormWebhookModel
): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            await handler.delete(
                window.route("api.forms.webhooks.delete", {
                    form: form.uuid,
                    webhook: webhook.id,
                })
            );

            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}
