import { defineStore } from "pinia";
import { callGetFormStoryboard } from "@/api/conversation";

type ConversationStore = {
    form: FormModel | null;
    storyboard: PublicFormBlockModel[] | null;
    queue: PublicFormBlockModel[] | null;
    current: number;
    payload: Record<string, any>;
    isProcessing: boolean;
    isSubmitted: boolean;
};

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: null,
            storyboard: null,
            queue: null,
            current: 0,
            payload: {},
            isProcessing: false,
            isSubmitted: false,
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

            return state.queue.length <= state.current + 1;
        },

        currentBlock: (state): PublicFormBlockModel | null => {
            if (state.queue && state.queue.length >= state.current) {
                return state.queue[state.current];
            }

            return null;
        },

        currentResponse(): string | null {
            if (this.currentBlockIdentifier) {
                return this.payload[this.currentBlockIdentifier];
            }

            return null;
        },

        currentBlockIdentifier(): string | null {
            if (!this.currentBlock) {
                return null;
            }

            return this.currentBlock.title || this.currentBlock.id;
        },
    },

    actions: {
        async initForm(id) {
            const response = await callGetFormStoryboard(id);

            this.storyboard = response.data.blocks;
            this.queue = response.data.blocks;
        },

        setResponse(value) {
            if (this.currentBlockIdentifier) {
                this.payload[this.currentBlockIdentifier] = value;
            }
        },

        back() {
            if (this.isFirstBlock) {
                return;
            }

            this.current -= 1;
        },

        /**
         * Increases current block by one or submits form if last block is triggered.
         * @returns {Promise<boolean>}
         */
        next(): Promise<boolean> {
            if (this.isLastBlock) {
                this.isProcessing = true;
                setTimeout(() => {
                    this.isSubmitted = true;
                    this.isProcessing = false;
                    console.log(
                        "submit form now",
                        JSON.stringify(this.payload)
                    );
                }, 1500);
                return Promise.resolve(true);
            }

            this.current += 1;
            return Promise.resolve(false);
        },
    },
});
