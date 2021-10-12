import { AxiosResponse } from "axios";
import handler from "./handler"

export function callCreateForm(): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await handler.post(window.route('api.forms.create'))

            resolve(response as AxiosResponse<FormModel>)
        } catch (error) {
            reject(error)
        }
    });
}

export function callUpdateForm(form: FormModel): Promise<AxiosResponse<FormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await handler.post(window.route('api.forms.update', { uuid: form.uuid }), form)

            resolve(response as AxiosResponse<FormModel>)
        } catch (error) {
            reject(error)
        }
    });
}
