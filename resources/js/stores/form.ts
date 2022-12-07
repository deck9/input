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
}

export const useForm = defineStore("form", {
    state: (): FormStore => {
        return {
            form: null,
            mapping: null,
            blocks: null,
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

        async createFormBlock(insertAfter: FormBlockModel | null = null) {
            if (!this.form) {
                return;
            }

            try {
                const response = await callCreateFormBlock(this.form.uuid);

                if (response.status === 201 && this.blocks) {
                    if (insertAfter !== null) {
                        const index = this.blocks.indexOf(insertAfter);
                        this.blocks.splice(index + 1, 0, response.data);
                    } else {
                        this.blocks.push(response.data);
                    }

                    // if new block has been created, we should select it for editing
                    const workbench = useWorkbench();

                    workbench.putOnWorkbench(response.data);
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

        async changeBlockSequence(from: number, to: number) {
            if (!this.blocks || !this.form) {
                return;
            }

            // move item to target position
            this.blocks.splice(to, 0, this.blocks.splice(from, 1)[0]);

            // set new sequence numbers to blocks
            this.blocks = this.blocks.map((item, key) => {
                return { ...item, sequence: key };
            });

            // generate an array of ids to update sequence on server
            const saveSequenceRequestData: Array<number> = this.blocks.map(
                (item) => {
                    return item.id;
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
