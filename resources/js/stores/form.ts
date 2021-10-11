import { defineStore } from "pinia";

declare interface FormStore {
    form: FormModel | null
    blocks: FormBlockModel[] | null
}

export const useForm = defineStore('form', {

    state: (): FormStore => {
        return {
            form: null,
            blocks: null,
        }
    },

    getters: {
        hasBlocks: (state): boolean => {
            return state.blocks && state.blocks.length ? true : false
        }
    }
});
