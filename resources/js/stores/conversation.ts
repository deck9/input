import { defineStore } from "pinia";
import { callGetFormStoryboard } from "@/api/conversation";

type ConversationStore = {
    form: FormModel | null;
    storyboard: PublicFormBlockModel[] | null;
    queue: PublicFormBlockModel[] | null;
    current: number;
};

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: null,
            storyboard: null,
            queue: null,
            current: 0,
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
    },

    actions: {
        async initForm(id) {
            const response = await callGetFormStoryboard(id);

            this.storyboard = response.data.blocks;
            this.queue = response.data.blocks;
        },

        next() {
            this.current += 1;
        },
    },
});
