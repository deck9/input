import { FormModel } from "@/types/app";
import axios, { AxiosResponse } from "axios"

const handler = axios.create({
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    }
})

export function callCreateForm(): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await handler.post(window.route('api.forms.create'))
            resolve(response)
        } catch (error) {
            reject(error)
        }
    });
}
