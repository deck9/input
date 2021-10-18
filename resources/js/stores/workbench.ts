import { callUpdateFormBlock } from "@/api/blocks";
import { defineStore } from "pinia";
import pick from "lodash/pick"

interface WorkbenchStore {
    block: FormBlockModel | null
}

export const useWorkbench = defineStore('workbench', {
    state: (): WorkbenchStore => {
        return {
            block: null
        }
    },

    actions: {

        clearWorkbench() {
            this.block = null
        },

        putOnWorkbench(block: FormBlockModel) {
            this.block = block
        },

        updateBlock(block: Partial<FormBlockModel>) {
            Object.entries(block).forEach((value) => {
                const key = value[0]
                const setting = value[1]

                if (this.block && this.block.hasOwnProperty(key)) {
                    this.block[key] = setting
                }
            })

            if (this.block) this.saveBlock(this.block)
        },

        async saveBlock(block: FormBlockModel) {

            try {
                let response = await callUpdateFormBlock(block)

                if (response.status === 200) {
                    console.log('saved success')
                }
            } catch (error) {
                console.warn(error)
            }
        }

    },

    debounce: {
        saveBlock: 1000,
    },
});
