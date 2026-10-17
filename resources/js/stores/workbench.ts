import { useForm } from "@/stores/form";
import { callUpdateFormBlock } from "@/api/blocks";
import { keepAlive } from "@/api/handler";
import { defineStore } from "pinia";
import { DebouncedFunc } from "lodash";
import {
    callCreateFormBlockInteraction,
    callDeleteFormBlockInteraction,
    callUpdateFormBlockInteraction,
    callUpdateInteractionSequence,
} from "@/api/interactions";
import { replaceRouteQuery } from "@/utils";
import { useNotice } from "./notice";
import useActiveInteractions from "@/components/Factory/Shared/useActiveInteractions";

// true while flushSaves sends the waiting saves as the page closes
let isLeaving = false;
// the answer as sent, before the changes that wait for their debounce
let sentInteraction: FormBlockInteractionModel | undefined;

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
                useNotice().waitForSave(`saveBlock:${this.block.id}`);
                this.saveBlock({ ...this.block });
            }
        },

        async saveBlock(block: FormBlockModel) {
            const config = isLeaving ? keepAlive(block) : undefined;

            await useNotice().send(
                `saveBlock:${block.id}`,
                () => callUpdateFormBlock(block, config),
                block,
            );
        },

        // sends the saves that wait for their debounce now, and waits for them
        async sendWaitingSaves() {
            await Promise.all([
                (this.saveBlock as DebouncedFunc<any>).flush(),
                (this.saveInteraction as DebouncedFunc<any>).flush(),
            ]);
        },

        // sends the saves that wait for their debounce now, as the page closes
        flushSaves() {
            isLeaving = true;

            try {
                (this.saveBlock as DebouncedFunc<any>).flush();
                (this.saveInteraction as DebouncedFunc<any>).flush();
            } finally {
                isLeaving = false;
            }
        },

        async createInteraction(
            type: FormBlockInteractionModel["type"],
            attributes?: Partial<FormBlockInteractionModel>,
        ): Promise<FormBlockInteractionModel | undefined> {
            // a retry adds the answer to this block, even after another opened
            const block = this.block;

            if (!block) {
                return;
            }

            return useNotice().send(
                `createInteraction:${block.id}`,
                async () => {
                    const response = await callCreateFormBlockInteraction(
                        block.id,
                        type,
                        attributes,
                    );

                    if (response.status === 201) {
                        block.interactions?.push(response.data);

                        return response.data;
                    }
                },
                block,
            );
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

            if (!useNotice().waitingSaves[`saveInteraction:${pointer.id}`]) {
                sentInteraction = { ...pointer };
            }

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
            useNotice().waitForSave(`saveInteraction:${pointer.id}`);
            this.saveInteraction({ ...pointer });
        },

        // a number on the way to a wrong one, e.g. "2" before "2.5", is no
        // change: the waiting save sends the option as it was sent before
        keepSentOption(id: number, option: keyof FormBlockInteractionSettings) {
            const pointer = this.block?.interactions?.find(
                (item) => item.id === id,
            );

            if (
                !pointer ||
                sentInteraction?.id !== id ||
                !useNotice().waitingSaves[`saveInteraction:${id}`]
            ) {
                return;
            }

            this.updateInteraction({
                id,
                options: {
                    ...pointer.options,
                    [option]: sentInteraction.options?.[option],
                },
            });
        },

        async deleteInteraction(interaction: { id: number }) {
            // a retry removes the answer from this block, even after another opened
            const block = this.block;
            const interactions = block?.interactions;

            if (!interactions?.some((item) => item.id === interaction.id)) {
                return;
            }

            await useNotice().send(
                `deleteInteraction:${interaction.id}`,
                async () => {
                    await callDeleteFormBlockInteraction(
                        interaction as FormBlockInteractionModel,
                    );

                    const index = interactions.findIndex(
                        (item) => item.id === interaction.id,
                    );

                    if (index !== -1) {
                        interactions.splice(index, 1);
                    }
                },
                block,
            );
        },

        async saveInteraction(interaction: FormBlockInteractionModel) {
            // the debounced save can run after the owner opened another block
            const block = useForm().blocks?.find(
                (item) => item.id === interaction.form_block_id,
            );
            const config = isLeaving ? keepAlive(interaction) : undefined;

            await useNotice().send(
                `saveInteraction:${interaction.id}`,
                () => callUpdateFormBlockInteraction(interaction, config),
                block,
            );
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

            const block = this.block;

            await useNotice().send(
                `interactionSequence:${block.id}`,
                () =>
                    callUpdateInteractionSequence(
                        block.id,
                        saveSequenceRequestData,
                    ),
                block,
            );
        },
    },

    debounce: {
        saveBlock: 1000,
        saveInteraction: 1000,
    },
});
