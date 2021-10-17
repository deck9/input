import { defineStore } from "pinia";

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

    }
});
