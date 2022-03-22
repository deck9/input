import { defineStore } from "pinia";
import { callGetFormStoryboard } from "@/api/conversation";

type ConversationStore = {
    form: FormModel | null;
    storyboard: PublicFormBlockModel[] | null;
    queue: PublicFormBlockModel[] | null;
    current: number;
    payload: Record<string, any>;
};

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: null,
            storyboard: null,
            queue: null,
            current: 0,
            payload: {},
        };
    },

    getters: {
        isLastBlock: (state): boolean => {
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

        next() {
            this.current += 1;
        },
    },
});
