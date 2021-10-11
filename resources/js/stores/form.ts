import { BlockModel, FormModel } from "@/types/app";
import { defineStore } from "pinia";

declare interface FormStore {
    form?: FormModel
    blocks?: BlockModel[]
}


export const useForm = defineStore('form', {

    state: (): FormStore => {
        return {
            form: undefined
        }
    }
});
