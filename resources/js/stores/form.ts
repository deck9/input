import { defineStore } from "pinia";
import { callUpdateForm } from "@/api/forms"
import { callGetFormBlocks, callCreateFormBlock, callUpdateBlockSequence, callDeleteFormBlock } from "@/api/blocks"

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
        async getBlocks() {
            if (!this.form) { return; }

            let response = await callGetFormBlocks(this.form.id)

            this.blocks = response.data
        },

        async updateForm(newValues: Partial<FormModel>) {
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

            await callUpdateForm(this.form)
        },

        async createFormBlock() {
            if (!this.form) {
                return
            }

            try {
                let response = await callCreateFormBlock(this.form.id)

                if (response.status === 201 && this.blocks) {
                    this.blocks.push(response.data)
                }
            } catch (error) {
                console.warn(error)
            }
        },

        async deleteFormBlock(block: FormBlockModel) {
            if (!this.form) {
                return
            }

            try {
                let response = await callDeleteFormBlock(block.id)

                if (response.status === 200) {
                    let index = this.blocks?.findIndex((item) => {
                        return item.id === block.id
                    })

                    if (index) this.blocks?.splice(index, 1)
                }
            } catch (error) {
                console.warn(error)
            }
        },

        async changeBlockSequence(from: number, to: number) {
            if (!this.blocks || !this.form) {
                return;
            }

            // move item to target position
            this.blocks.splice(to, 0, this.blocks.splice(from, 1)[0])

            // set new sequence numbers to blocks
            this.blocks = this.blocks.map((item, key) => {
                return { ...item, sequence: key }
            })

            // generate an array of ids to update sequence on server
            let saveSequenceRequestData: Array<number> = this.blocks.map((item) => {
                return item.id;
            })

            try {
                await callUpdateBlockSequence(this.form.id, saveSequenceRequestData)
            } catch (error) {
                console.warn(error)
            }
        },

    }
});
