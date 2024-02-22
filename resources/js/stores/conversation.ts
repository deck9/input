import { defineStore } from "pinia";
import {
    callCreateFormSession,
    callGetFormStoryboard,
    callSubmitForm,
    callGetForm,
    callUploadFiles,
} from "@/api/conversation";
import { Ref, ref } from "vue";

type ConversationStore = {
    form?: PublicFormModel;
    session?: FormSessionModel;
    storyboard: PublicFormBlockModel[] | null;
    queue: PublicFormBlockModel[] | null;
    current: number;
    payload: FormSubmitPayload;
    isProcessing: boolean;
    isSubmitted: boolean;
    isInputMode: boolean;
};

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: undefined,
            session: undefined,
            storyboard: null,
            queue: null,
            current: 0,
            payload: {},
            isProcessing: false,
            isSubmitted: false,
            isInputMode: false,
        };
    },

    getters: {
        isFirstBlock(state): boolean {
            if (!state.queue) {
                return false;
            }

            return state.current === 0;
        },

        isLastBlock(state): boolean {
            if (!state.queue) {
                return false;
            }

            return state.current + 1 >= state.queue.length;
        },

        currentBlock: (state): PublicFormBlockModel | null => {
            if (state.queue && state.queue.length >= state.current) {
                return state.queue[state.current];
            }

            return null;
        },

        currentPayload(
            state,
        ): FormBlockInteractionPayload | FormBlockInteractionPayload[] | null {
            if (!this.currentBlock) return null;

            if (state.payload[this.currentBlock.id]) {
                return state.payload[this.currentBlock.id];
            }

            return null;
        },

        countCurrentSelections(): number {
            if (!this.currentPayload) return 0;

            if (Array.isArray(this.currentPayload)) {
                return this.currentPayload.length;
            }

            return 1;
        },

        hasRequiredFields(): boolean {
            if (!this.currentBlock) return false;

            if (this.currentBlock.is_required) {
                return true;
            }
            this.currentBlock.interactions.forEach((interaction) => {
                if (interaction.options?.required) {
                    return true;
                }
            });

            return false;
        },

        /**
         * This getter determines if the user has entered content that is not saved yet.
         * For now that is the case once a user typed something in and is at least
         * on a second block.
         *
         * @param state
         * @returns true | false
         */
        hasUnsavedPayload(state): Ref<boolean> {
            return ref(
                !state.isSubmitted &&
                    state.payload &&
                    Object.keys(state.payload).length > 0 &&
                    state.current > 0,
            );
        },

        currentBlockIdentifier(): string | null {
            if (!this.currentBlock) {
                return null;
            }

            return this.currentBlock.title || this.currentBlock.id;
        },

        callToActionUrl(state): string | null {
            if (!state.form || !state.session) {
                return null;
            }

            const params = new URLSearchParams();

            // we should always attach the session id as a query parameter
            if (state.form.cta_append_session_id && state.session.token) {
                params.append("ipt_session", state.session.token);
            }

            if (
                state.form.cta_append_params &&
                state.session.params &&
                Object.keys(state.session.params).length > 0
            ) {
                for (const key of Object.keys(state.session.params)) {
                    params.append(key, state.session.params[key]);
                }
            }

            if ([...params].length) {
                return state.form.cta_link + "?" + params.toString();
            }

            return state.form.cta_link;
        },

        uploadsPayload(state): Record<
            string,
            FormBlockUploadPayload
        > {
            const uploads = {};

            for (const block in state.payload) {
                const blockPayload = state.payload[block];

                if (Array.isArray(blockPayload)) {
                    continue;
                }

                if (blockPayload.payload.some((f) => f instanceof File)) {
                    uploads[block] = blockPayload;
                }
            }

            return uploads;
        },

        hasFileUploads(state): boolean {
            return Object.values(state.payload).some((block) => {
                if (!Array.isArray(block)) {
                    return block.payload.some((p) => {
                        return p instanceof File;
                    });
                }
            });
        },
    },

    actions: {
        async initForm(
            initialPayload: string | PublicFormModel,
            params: Record<string, string>,
        ) {
            const id =
                typeof initialPayload === "string"
                    ? initialPayload
                    : initialPayload.uuid;

            if (typeof initialPayload !== "string") {
                this.form = initialPayload as PublicFormModel;
            } else {
                const response = await callGetForm(id);
                this.form = response.data;
            }

            const storyboardResponse = await callGetFormStoryboard(id);
            const formSessionResponse = await callCreateFormSession(id, params);

            this.session = formSessionResponse.data;
            this.storyboard = storyboardResponse.data.blocks;

            this.queue = this.storyboard.filter((block) => {
                return block.parent_block === null;
            });

            // if the first block is a group, we need to evaluate it
            if (this.currentBlock?.type === "group") {
                this.evaluateGroupBlock(this.currentBlock);
                this.next();
            }
        },

        enableInputMode() {
            this.isInputMode = true;
        },

        disableInputMode() {
            this.isInputMode = false;
        },

        setResponse(
            action: PublicFormBlockInteractionModel,
            value: string | boolean | number | File[] | null,
        ) {
            if (!this.currentBlock) return;

            this.payload[this.currentBlock.id] = {
                payload: value,
                actionId: action.id,
            };
        },

        toggleResponse(
            action: PublicFormBlockInteractionModel,
            value:
                | Record<string, string | boolean | null>
                | string
                | boolean
                | null,
        ) {
            if (!this.currentBlock) return;

            const givenPayload = {
                payload: value,
                actionId: action.id,
            };
            const currentPayload = this.payload[this.currentBlock.id];

            if (!Array.isArray(currentPayload)) {
                this.payload[this.currentBlock.id] = [givenPayload];
            } else {
                const foundIndex = currentPayload.findIndex(
                    (p) => p.actionId === action.id,
                );

                foundIndex === -1
                    ? currentPayload.push(givenPayload)
                    : currentPayload.splice(foundIndex, 1);
            }
        },

        back() {
            if (this.isFirstBlock) {
                return;
            }

            this.current -= 1;

            // if we are on a group block, we need to go back again
            if (this.currentBlock?.type === "group") {
                this.back();
            }
        },

        /**
         * Increases current block by one or submits form if last block is triggered.
         * @returns {Promise<boolean>}
         */
        async next(): Promise<boolean> {
            if (this.isLastBlock) {
                this.isProcessing = true;

                if (this.form?.uuid && this.session?.token) {
                    await callSubmitForm(
                        this.form.uuid,
                        this.session.token,
                        this.payload,
                    );

                    if (this.hasFileUploads) {
                        // upload files
                        await callUploadFiles(
                            this.form.uuid,
                            this.session.token,
                            this.uploadsPayload,
                        );
                    }

                    // If a redirect is configured, we redirect the user to the given url
                    if (this.form.use_cta_redirect && this.callToActionUrl) {
                        window.location.href = this.callToActionUrl;

                        return Promise.resolve(true);
                    }

                    this.isSubmitted = true;
                    this.isProcessing = false;

                    return Promise.resolve(true);
                } else {
                    this.isProcessing = false;
                    return Promise.reject(new Error("Form or session not set"));
                }
            } else {
                this.current += 1;

                // need to check if the next block is a group block
                if (this.currentBlock?.type === "group") {
                    this.evaluateGroupBlock(this.currentBlock);

                    // we call next, since the group block has no other action
                    return this.next();
                }

                return Promise.resolve(false);
            }
        },

        evaluateGroupBlock(currentBlock: PublicFormBlockModel) {
            // we first should remove all blocks related to that group
            this.queue =
                this.queue?.filter((block) => {
                    return block.parent_block !== currentBlock?.id;
                }) ?? [];

            // now we find all children from the storyboard
            const children = this.storyboard?.filter((block) => {
                return block.parent_block === currentBlock?.id;
            });

            // we add the children to the queue
            if (children && children?.length > 0) {
                this.queue?.splice(this.current + 1, 0, ...children);
            }
        },
    },
});
