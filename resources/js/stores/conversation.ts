import { defineStore } from "pinia";
import { callGetFormStoryboard } from "@/api/conversation";

type FormBlockInteractionPayload = {
    payload: any;
    actionId: string;
};

type ConversationStore = {
    form?: PublicFormModel;
    storyboard: PublicFormBlockModel[] | null;
    queue: PublicFormBlockModel[] | null;
    current: number;
    payload: Record<
        string,
        FormBlockInteractionPayload | FormBlockInteractionPayload[]
    >;
    isProcessing: boolean;
    isSubmitted: boolean;
};

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: undefined,
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

            return state.current + 1 >= state.queue.length;
        },

        currentBlock: (state): PublicFormBlockModel | null => {
            if (state.queue && state.queue.length >= state.current) {
                return state.queue[state.current];
            }

            return null;
        },

        currentPayload(
            state
        ): FormBlockInteractionPayload | FormBlockInteractionPayload[] | null {
            if (!this.currentBlock) return null;

            if (state.payload[this.currentBlock.id]) {
                return state.payload[this.currentBlock.id];
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
        async initForm(initialPayload: string | PublicFormModel) {
            const id =
                typeof initialPayload === "string"
                    ? initialPayload
                    : initialPayload.uuid;

            if (typeof initialPayload !== "string") {
                this.form = initialPayload as PublicFormModel;
            } else {
                console.log("todo: get public form model from api");
            }

            const storyboardResponse = await callGetFormStoryboard(id);

            this.storyboard = storyboardResponse.data.blocks;
            this.queue = storyboardResponse.data.blocks;
        },

        setResponse(
            action: PublicFormBlockInteractionModel,
            value: string | boolean | null
        ) {
            if (!this.currentBlock) return;

            this.payload[this.currentBlock.id] = {
                payload: value,
                actionId: action.id,
            };
        },

        toggleResponse(
            action: PublicFormBlockInteractionModel,
            value: string | boolean | null
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
                    (p) => p.actionId === action.id
                );

                if (foundIndex === -1) {
                    currentPayload.push(givenPayload);
                } else {
                    currentPayload.splice(foundIndex, 1);
                }
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
