import { callUpdateFormBlock } from "@/api/blocks";
import { defineStore } from "pinia";
import { DebouncedFunc } from "lodash";
import { callCreateFormBlockInteraction, callDeleteFormBlockInteraction, callUpdateFormBlockInteraction } from "@/api/interactions";
import { replaceRouteQuery } from "@/utils";

interface WorkbenchStore {
    block: FormBlockModel | null
    isSavingInteraction: number | null
    isEditingFinalBlock: boolean
}

export const useWorkbench = defineStore('workbench', {
    state: (): WorkbenchStore => {
        return {
            block: null,
            isSavingInteraction: null,
            isEditingFinalBlock: false,
        }
    },

    getters: {
        needsInteractionSetup: (state): boolean => {
            const typesWithSetup = ["click", "multiple", "input"];

            return state.block ? typesWithSetup.includes(state.block.type) : false;
        },

        isMultipleChoice: (state): boolean => state.block?.type === 'multiple'
    },

    actions: {

        clearWorkbench() {
            this.block = null
            this.isEditingFinalBlock = false
        },

        editFinalBlock() {
            this.clearWorkbench()
            this.isEditingFinalBlock = true
        },

        putOnWorkbench(block: FormBlockModel) {
            // flush save function before changing page
            (this.saveBlock as DebouncedFunc<any>).flush()

            replaceRouteQuery({ block: block.uuid })

            // change block content
            this.isEditingFinalBlock = false
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

            if (this.block) {
                this.saveBlock({ ...this.block })
            }
        },

        async saveBlock(block: FormBlockModel) {
            try {
                let response = await callUpdateFormBlock(block)

                if (response.status === 200) {
                    console.log('saved block success')
                }
            } catch (error) {
                console.warn(error)
            }
        },

        async createInteraction(type: FormBlockInteractionModel["type"]): Promise<FormBlockInteractionModel | undefined> {

            if (!this.block) {
                return;
            }

            try {
                let response = await callCreateFormBlockInteraction(this.block?.id, type)

                if (response.status === 201) {
                    this.block.interactions?.push(response.data)

                    return response.data
                }
            } catch (error) {
                console.warn(error)
            }
        },

        updateInteraction(interaction: { id: number } & Partial<FormBlockInteractionModel>) {

            const index = this.block?.interactions?.findIndex((item) => {
                return interaction.id === item.id
            })

            if (!this.block?.interactions || typeof index === 'undefined' || index === -1) return;

            const pointer = this.block?.interactions[index];

            Object.entries(interaction).forEach((value) => {
                const key = value[0]
                const setting = value[1]

                if (pointer.hasOwnProperty(key)) {
                    pointer[key] = setting
                }
            })

            if (this.isSavingInteraction && this.isSavingInteraction !== pointer.id) {
                (this.saveInteraction as DebouncedFunc<any>).flush();
                this.isSavingInteraction = null;
            }

            this.isSavingInteraction = pointer.id
            this.saveInteraction({ ...pointer })
        },

        async deleteInteraction(interaction: { id: number }) {

            const index = this.block?.interactions?.findIndex((item) => {
                return interaction.id === item.id
            })

            if (!this.block?.interactions || typeof index === 'undefined' || index === -1) return;

            try {
                await callDeleteFormBlockInteraction(interaction as FormBlockInteractionModel);

                this.block.interactions.splice(index, 1)
            } catch (error) {
                console.warn(error)
            }
        },

        async saveInteraction(interaction: FormBlockInteractionModel) {
            try {
                let response = await callUpdateFormBlockInteraction(interaction)

                if (response.status === 200) {
                    console.log('saving interaction success')
                }
            } catch (error) {
                console.warn(error)
            }
        },

    },

    debounce: {
        saveBlock: 1000,
        saveInteraction: 1000,
    },
});
