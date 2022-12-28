/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callCreateFormBlockInteraction(
    id: number,
    type: FormBlockInteractionModel["type"],
    attributes?: Partial<FormBlockInteractionModel>
): Promise<AxiosResponse<FormBlockInteractionModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.interactions.create", { block: id }),
                {
                    type,
                    ...attributes,
                }
            );

            resolve(response as AxiosResponse<FormBlockInteractionModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateFormBlockInteraction(
    interaction: FormBlockInteractionModel
): Promise<AxiosResponse<FormBlockInteractionModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.interactions.update", {
                    interaction: interaction.id,
                }),
                interaction
            );

            resolve(response as AxiosResponse<FormBlockInteractionModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteFormBlockInteraction(
    interaction: FormBlockInteractionModel
): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.delete(
                window.route("api.interactions.delete", {
                    interaction: interaction.id,
                })
            );

            if (response.status === 200) {
                resolve(response);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateInteractionSequence(
    id: number,
    sequence: number[]
): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.interactions.sequence", { block: id }),
                {
                    sequence,
                }
            );

            resolve(response as AxiosResponse);
        } catch (error) {
            reject(error);
        }
    });
}
