/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callGetFormIntegrations(
    form: FormModel
): Promise<AxiosResponse<Array<FormIntegrationModel>>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.forms.integrations.index", {
                    uuid: form.uuid,
                })
            );

            resolve(response as AxiosResponse<Array<FormIntegrationModel>>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callCreateFormIntegrations(
    form: FormModel,
    integration: Partial<FormIntegrationModel>
): Promise<AxiosResponse<FormIntegrationModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.integrations.create", {
                    uuid: form.uuid,
                }),
                integration
            );

            resolve(response as AxiosResponse<FormIntegrationModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateFormIntegrations(
    form: FormModel,
    integration: FormIntegrationModel
): Promise<AxiosResponse<FormIntegrationModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.forms.integrations.update", {
                    form: form.uuid,
                    integration: integration.id,
                }),
                integration
            );

            resolve(response as AxiosResponse<FormIntegrationModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteFormIntegration(
    form: FormModel,
    integration: FormIntegrationModel
): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            await handler.delete(
                window.route("api.forms.integrations.delete", {
                    form: form.uuid,
                    integration: integration.id,
                })
            );

            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}
