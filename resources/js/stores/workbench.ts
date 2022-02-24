import { callUpdateFormBlock } from "@/api/blocks";
import { defineStore } from "pinia";
import { DebouncedFunc } from "lodash";
import {
    callCreateFormBlockInteraction,
    callDeleteFormBlockInteraction,
    callUpdateFormBlockInteraction,
} from "@/api/interactions";
import { replaceRouteQuery } from "@/utils";
import useActiveInteractions from "@/components/Factory/Shared/useActiveInteractions";
import { ComputedRef } from "vue";

interface WorkbenchStore {
    block: FormBlockModel | null;
    isSavingInteraction: number | null;
    isEditingFinalBlock: boolean;
}

export const useWorkbench = defineStore("workbench", {
    state: (): WorkbenchStore => {
        return {
            block: null,
            isSavingInteraction: null,
            isEditingFinalBlock: false,
        };
    },

    getters: {
        needsInteractionSetup: (state): boolean => {
            const typesWithSetup = ["click", "multiple", "input"];

            return state.block
                ? typesWithSetup.includes(state.block.type)
                : false;
        },

        isMultipleChoice: (state): boolean => state.block?.type === "multiple",

        currentInteractions: (
            state
        ): FormBlockInteractionModel[] | undefined => {
            if (!state.block) {
                return undefined;
            }

            const { activeInteractions } = useActiveInteractions(state.block);

            return activeInteractions.value;
        },
    },

    actions: {
        clearWorkbench() {
            this.block = null;
            this.isEditingFinalBlock = false;
        },

        editFinalBlock() {
            this.clearWorkbench();
            this.isEditingFinalBlock = true;
            replaceRouteQuery({ block: "final" });
        },

        putOnWorkbench(block: FormBlockModel) {
            // flush save function before changing page
            (this.saveBlock as DebouncedFunc<any>).flush();

            replaceRouteQuery({ block: block.uuid });

            // change block content
            this.isEditingFinalBlock = false;
            this.block = block;
        },

        updateBlock(block: Partial<FormBlockModel>) {
            Object.entries(block).forEach((value) => {
                const key = value[0];
                const setting = value[1];

                if (
                    this.block &&
                    Object.prototype.hasOwnProperty.call(this.block, key)
                ) {
                    this.block[key] = setting;
                }
            });

            if (this.block) {
                this.saveBlock({ ...this.block });
            }
        },

        async saveBlock(block: FormBlockModel) {
            try {
                const response = await callUpdateFormBlock(block);

                if (response.status === 200) {
                    console.log("saved block success");
                }
            } catch (error) {
                console.warn(error);
            }
        },

        async createInteraction(
            type: FormBlockInteractionModel["type"]
        ): Promise<FormBlockInteractionModel | undefined> {
            if (!this.block) {
                return;
            }

            try {
                const response = await callCreateFormBlockInteraction(
                    this.block?.id,
                    type
                );

                if (response.status === 201) {
                    this.block.interactions?.push(response.data);

                    return response.data;
                }
            } catch (error) {
                console.warn(error);
            }
        },

        updateInteraction(
            interaction: { id: number } & Partial<FormBlockInteractionModel>
        ) {
            const index = this.block?.interactions?.findIndex((item) => {
                return interaction.id === item.id;
            });

            if (
                !this.block?.interactions ||
                typeof index === "undefined" ||
                index === -1
            )
                return;

            const pointer = this.block?.interactions[index];

            Object.entries(interaction).forEach((value) => {
                const key = value[0];
                const setting = value[1];

                if (Object.prototype.hasOwnProperty.call(pointer, key)) {
                    pointer[key] = setting;
                }
            });

            if (
                this.isSavingInteraction &&
                this.isSavingInteraction !== pointer.id
            ) {
                (this.saveInteraction as DebouncedFunc<any>).flush();
                this.isSavingInteraction = null;
            }

            this.isSavingInteraction = pointer.id;
            this.saveInteraction({ ...pointer });
        },

        async deleteInteraction(interaction: { id: number }) {
            const index = this.block?.interactions?.findIndex((item) => {
                return interaction.id === item.id;
            });

            if (
                !this.block?.interactions ||
                typeof index === "undefined" ||
                index === -1
            )
                return;

            try {
                await callDeleteFormBlockInteraction(
                    interaction as FormBlockInteractionModel
                );

                this.block.interactions.splice(index, 1);
            } catch (error) {
                console.warn(error);
            }
        },

        async saveInteraction(interaction: FormBlockInteractionModel) {
            try {
                const response = await callUpdateFormBlockInteraction(
                    interaction
                );

                if (response.status === 200) {
                    console.log("saving interaction success");
                }
            } catch (error) {
                console.warn(error);
            }
        },

        async changeInteractionSequence(from: number, to: number) {
            if (!this.currentInteractions || !this.block?.interactions) {
                return;
            }

            const items = this.currentInteractions.map((i) => i.id);

            // move item to target position
            items.splice(to, 0, items.splice(from, 1)[0]);

            // set new sequence numbers to blocks
            items.map((id, key) => {
                if (!this.block?.interactions) {
                    return;
                }

                const index = this.block.interactions.findIndex((item) => {
                    return item.id === id;
                });

                if (index !== -1) {
                    this.block.interactions[index].sequence = key;
                }
            });
        },
    },

    debounce: {
        saveBlock: 1000,
        saveInteraction: 1000,
    },
});
