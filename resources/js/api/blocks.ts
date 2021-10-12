import { AxiosResponse } from "axios";
import handler from "./handler"

export function callGetFormBlocks(id: number): Promise<AxiosResponse<FormBlockModel[]>> {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await handler.get(window.route('api.blocks.index', { form: id }))
            resolve(response as AxiosResponse<FormBlockModel[]>)
        } catch (error) {
            reject(error)
        }
    });
}
