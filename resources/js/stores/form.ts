import { defineStore } from "pinia";
import {callUpdateForm} from "@/api/forms"

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
    },

    actions: {
        async updateForm(newValues: Record<string, unknown>) {
            if (!this.form) {
                return
            }

            Object.entries(newValues).forEach((value) => {
                const key = value[0]
                const setting = value[1]

                if (this.form && this.form.hasOwnProperty(key)) {
                    this.form[key] = setting
                }
            })

            let response = await callUpdateForm(this.form)
        }
    }
});
