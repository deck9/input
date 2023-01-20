/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callGetFormBlocks(
    uuid: string,
    includeSubmissions = false
): Promise<AxiosResponse<FormBlockModel[]>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.blocks.index", { form: uuid }),
                {
                    params: {
                        includeSubmissions,
                    },
                }
            );

            resolve(response as AxiosResponse<FormBlockModel[]>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callCreateFormBlock(
    uuid: string,
    type: FormBlockType | null = null
): Promise<AxiosResponse<FormBlockModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.blocks.create", { form: uuid }),
                {
                    type,
                }
            );

            resolve(response as AxiosResponse<FormBlockModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateFormBlock(
    block: FormBlockModel
): Promise<AxiosResponse<FormBlockModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.blocks.update", { block: block.id }),
                block
            );

            resolve(response as AxiosResponse<FormBlockModel>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteFormBlock(id: number): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.delete(
                window.route("api.blocks.delete", { block: id })
            );

            resolve(response as AxiosResponse);
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateBlockSequence(
    uuid: string,
    sequence: number[]
): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.blocks.sequence", { form: uuid }),
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
