import { useForm } from "@/stores/form";
import { callUpdateFormBlock } from "@/api/blocks";
import { defineStore } from "pinia";
import { DebouncedFunc } from "lodash";
import {
    callCreateFormBlockInteraction,
    callDeleteFormBlockInteraction,
    callUpdateFormBlockInteraction,
    callUpdateInteractionSequence,
} from "@/api/interactions";
import { replaceRouteQuery } from "@/utils";
import useActiveInteractions from "@/components/Factory/Shared/useActiveInteractions";

interface WorkbenchStore {
    block: FormBlockModel | null;
    isSavingInteraction: number | null;
}

export const useWorkbench = defineStore("workbench", {
    state: (): WorkbenchStore => {
        return {
            block: null,
            isSavingInteraction: null,
        };
    },

    getters: {
        needsInteractionSetup: (state): boolean => {
            const store = useForm();

            if (!store.mapping || !state.block) {
                return false;
            }

            return typeof store.mapping[state.block.type] !== "undefined";
        },

        usesInteractionType: (state): FormBlockInteractionType | undefined => {
            const store = useForm();

            if (!store.mapping || !state.block) {
                return undefined;
            }

            return store.mapping[state.block.type];
        },

        isCheckboxInput: (state): boolean => state.block?.type === "checkbox",

        currentInteractions: (
            state,
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
        },

        putOnWorkbench(block: FormBlockModel) {
            // flush save function before changing page
            (this.saveBlock as DebouncedFunc<any>).flush();

            replaceRouteQuery({ block: block.uuid });

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
                    console.info("saved block success");
                }
            } catch (error) {
                console.warn(error);
            }
        },

        async createInteraction(
            type: FormBlockInteractionModel["type"],
            attributes?: Partial<FormBlockInteractionModel>,
        ): Promise<FormBlockInteractionModel | undefined> {
            if (!this.block) {
                return;
            }

            try {
                const response = await callCreateFormBlockInteraction(
                    this.block?.id,
                    type,
                    attributes,
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
            interaction: { id: number } & Partial<FormBlockInteractionModel>,
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
                    interaction as FormBlockInteractionModel,
                );

                this.block.interactions.splice(index, 1);
            } catch (error) {
                console.warn(error);
            }
        },

        async saveInteraction(interaction: FormBlockInteractionModel) {
            try {
                const response =
                    await callUpdateFormBlockInteraction(interaction);

                if (response.status === 200) {
                    console.info("saving interaction success");
                }
            } catch (error) {
                console.warn(error);
            }
        },

        async changeInteractionSequence(from: number, to: number) {
            if (!this.currentInteractions || !this.block?.interactions) {
                return;
            }

            const saveSequenceRequestData: Array<number> =
                this.currentInteractions
                    .filter((i) => !i.name)
                    .map((i) => i.id);

            // move item to target position
            saveSequenceRequestData.splice(
                to,
                0,
                saveSequenceRequestData.splice(from, 1)[0],
            );

            // set new sequence numbers to blocks
            saveSequenceRequestData.map((id, key) => {
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

            try {
                await callUpdateInteractionSequence(
                    this.block.id,
                    saveSequenceRequestData,
                );
            } catch (error) {
                console.warn(error);
            }
        },
    },

    debounce: {
        saveBlock: 1000,
        saveInteraction: 1000,
    },
});
