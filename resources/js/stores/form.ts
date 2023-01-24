import { defineStore } from "pinia";
import {
    callDeleteFormImage,
    callUpdateForm,
    callGetForm,
    callUploadFormImage,
    callGetFormBlockMapping,
    callDeleteForm,
    callPublishForm,
    callUnpublishForm,
} from "@/api/forms";
import {
    callGetFormBlocks,
    callCreateFormBlock,
    callUpdateBlockSequence,
    callDeleteFormBlock,
} from "@/api/blocks";
import { useWorkbench } from ".";

interface FormStore {
    form: FormModel | null;
    blocks: FormBlockModel[] | null;
    mapping: Record<FormBlockType, FormBlockInteractionType> | null;
    enableCssTransition: boolean;
}

export const useForm = defineStore("form", {
    state: (): FormStore => {
        return {
            form: null,
            mapping: null,
            blocks: null,
            enableCssTransition: true,
        };
    },

    getters: {
        formId: (state): string | null => {
            return state.form ? state.form.uuid : null;
        },

        hasBlocks: (state): boolean => {
            return state.blocks && state.blocks.length ? true : false;
        },

        formUrl: (state): string => {
            if (state.form) {
                return window.route("forms.show", { uuid: state.form?.uuid });
            }

            return "";
        },
    },

    actions: {
        clearForm() {
            this.form = null;
            this.blocks = null;
        },

        setCssTransition(payload: boolean) {
            this.enableCssTransition = payload;
        },

        async refreshForm(includeSubmissions = false) {
            if (this.form) {
                const response = await callGetForm(this.form);
                this.form = null;
                this.form = response.data;
            }

            if (this.blocks) {
                await this.getBlocks(includeSubmissions);
            }

            return Promise.resolve(true);
        },

        async getFormBlockMapping() {
            const response = await callGetFormBlockMapping();

            this.mapping = response.data.mapping;
        },

        async getBlocks(includeSubmissions = false) {
            if (!this.form) {
                return;
            }

            const response = await callGetFormBlocks(
                this.form.uuid,
                includeSubmissions
            );

            this.blocks = response.data;
        },

        async changeFormImage(file: File, type: ImageType) {
            if (!this.form) {
                return;
            }

            const response = await callUploadFormImage(this.form, file, type);
            this.form[type] = response.data[type];
        },

        async removeFormImage(type: ImageType) {
            if (!this.form) {
                return;
            }

            await callDeleteFormImage(this.form, type);
            this.form[type] = null;
        },

        async updateForm(newValues: Partial<FormModel>) {
            if (!this.form) {
                return;
            }

            Object.entries(newValues).forEach((value) => {
                const key = value[0];
                const setting = value[1];

                if (
                    this.form &&
                    Object.prototype.hasOwnProperty.call(this.form, key)
                ) {
                    this.form[key] = setting;
                }
            });

            await callUpdateForm(this.form);
        },

        async deleteForm() {
            if (!this.form) {
                return;
            }

            const result = await callDeleteForm(this.form);
            if (result) {
                this.clearForm();
            }

            return Promise.resolve();
        },

        async publishForm() {
            if (!this.form) {
                return;
            }

            const result = await callPublishForm(this.form);

            this.form = result.data;

            return Promise.resolve();
        },

        async unpublishForm() {
            if (!this.form) {
                return;
            }

            const result = await callUnpublishForm(this.form);

            this.form = result.data;

            return Promise.resolve();
        },

        async createFormBlock(
            insertAfter: FormBlockModel | null = null,
            type: FormBlockType | null = null
        ) {
            if (!this.form) {
                return;
            }

            try {
                const response = await callCreateFormBlock(
                    this.form.uuid,
                    type
                );

                const newBlock = response.data;

                if (response.status === 201 && this.blocks) {
                    if (insertAfter !== null) {
                        const index = this.blocks.indexOf(insertAfter);

                        if (insertAfter.type === "group") {
                            newBlock.parent_block = insertAfter.uuid;
                        } else {
                            newBlock.parent_block = insertAfter.parent_block;
                        }

                        this.blocks.splice(index + 1, 0, newBlock);

                        this.saveBlockSequence();
                    } else {
                        this.blocks.push(newBlock);
                    }

                    // if new block has been created, we should select it for editing
                    const workbench = useWorkbench();

                    workbench.putOnWorkbench(newBlock);
                }
            } catch (error) {
                console.warn(error);
            }
        },

        async deleteFormBlock(block: FormBlockModel) {
            if (!this.form) {
                return;
            }

            try {
                const response = await callDeleteFormBlock(block.id);

                if (response.status === 200) {
                    const index = this.blocks?.findIndex((item) => {
                        return item.id === block.id;
                    });

                    if (typeof index !== "undefined" && index !== -1) {
                        this.blocks?.splice(index, 1);
                    }
                }
            } catch (error) {
                console.warn(error);
            }
        },

        async changeBlockSequence(
            parentBlock: string | false,
            to: number,
            block: FormBlockModel
        ) {
            if (!this.blocks || !this.form) {
                return;
            }

            block.parent_block = parentBlock || null;

            // removed index is easy, we just find the index of the block
            const removedIndex = this.blocks.findIndex((item) => {
                return item.id === block.id;
            });

            // target index is a bit more complicated, lets set it to 0 for now
            let targetIndex = -1;

            // if we have a scope, we need to get all blocks in that scope
            // the "to" value is relative to the scope
            const blocksInScope = this.blocks.filter((item) => {
                if (parentBlock && item.parent_block === parentBlock) {
                    return true;
                }

                return !parentBlock && !item.parent_block;
            });

            // if we have blocks in scope, and the "to" value is less than the length of the blocks in scope
            if (blocksInScope.length > 0 && blocksInScope.length > to) {
                const targetBlock = blocksInScope[to];
                targetIndex = this.blocks.findIndex((item) => {
                    return item.id === targetBlock.id;
                });
            }

            this.blocks.splice(removedIndex, 1); // remove from old position

            if (targetIndex !== -1) {
                this.blocks.splice(targetIndex, 0, block); // add to new position
            } else {
                // if we don't have a target index, we just push it to the end
                this.blocks.push(block);
            }

            await this.saveBlockSequence();
        },

        async saveBlockSequence() {
            if (!this.blocks || !this.form) {
                return;
            }

            // set new sequence numbers to blocks
            this.blocks.map((item, index) => {
                return { ...item, sequence: index };
            });

            // generate an array of ids to update sequence on server
            const saveSequenceRequestData: Array<any> = this.blocks.map(
                (item) => {
                    return { id: item.id, scope: item.parent_block };
                }
            );

            try {
                await callUpdateBlockSequence(
                    this.form.uuid,
                    saveSequenceRequestData
                );
            } catch (error) {
                console.warn(error);
            }
        },
    },
});
