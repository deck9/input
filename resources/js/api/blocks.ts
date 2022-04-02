/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callGetFormBlocks(
    id: number,
    includeResults = false
): Promise<AxiosResponse<FormBlockModel[]>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.get(
                window.route("api.blocks.index", { form: id }),
                {
                    params: {
                        includeResults,
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
    id: number
): Promise<AxiosResponse<FormBlockModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.blocks.create", { form: id })
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
    id: number,
    sequence: number[]
): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.blocks.sequence", { form: id }),
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
