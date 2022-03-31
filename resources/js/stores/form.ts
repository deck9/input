import { defineStore } from "pinia";
import {
    callDeleteAvatar,
    callUpdateForm,
    callGetForm,
    callUploadAvatar,
    callGetFormBlockMapping,
    callDeleteForm,
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
    mapping: Record<string, string> | null;
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

        async refreshForm() {
            if (this.form) {
                const response = await callGetForm(this.form);
                this.form = response.data;
            }

            if (this.blocks) {
                await this.getBlocks();
            }

            return Promise.resolve(true);
        },

        async getFormBlockMapping() {
            const response = await callGetFormBlockMapping();

            this.mapping = response.data.mapping;
        },

        async getBlocks() {
            if (!this.form) {
                return;
            }

            const response = await callGetFormBlocks(this.form.id);

            this.blocks = response.data;
        },

        async changeAvatar(file: File) {
            if (!this.form) {
                return;
            }

            const response = await callUploadAvatar(this.form, file);
            this.form.avatar = response.data.avatar;
        },

        async removeAvatar() {
            if (!this.form) {
                return;
            }

            await callDeleteAvatar(this.form);
            this.form.avatar = null;
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

        async createFormBlock(insertAfter: FormBlockModel | null = null) {
            if (!this.form) {
                return;
            }

            try {
                const response = await callCreateFormBlock(this.form.id);

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

                    if (index) this.blocks?.splice(index, 1);
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
                    this.form.id,
                    saveSequenceRequestData
                );
            } catch (error) {
                console.warn(error);
            }
        },
    },
});
