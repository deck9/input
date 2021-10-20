import { AxiosResponse } from "axios";
import handler from "./handler"

export function callCreateFormBlockInteraction(id: number, type: FormBlockInteractionModel["type"]): Promise<AxiosResponse<FormBlockInteractionModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await handler.post(window.route('api.interactions.create', { block: id }), {
                type
            })

            resolve(response as AxiosResponse<FormBlockInteractionModel>)
        } catch (error) {
            reject(error)
        }
    });
}

export function callUpdateFormBlockInteraction(interaction: FormBlockInteractionModel): Promise<AxiosResponse<FormBlockInteractionModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await handler.post(window.route('api.interactions.update', { interaction: interaction.id }), interaction)

            resolve(response as AxiosResponse<FormBlockInteractionModel>)
        } catch (error) {
            reject(error)
        }
    });
}
