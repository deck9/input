import { defineStore } from "pinia";
import { callGetFormStoryboard } from "@/api/conversation";

type ConversationStore = {
    form: FormModel | null;
    storyboard: FormBlockModel[] | null;
    queue: FormBlockModel[] | null;
};

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: null,
            storyboard: null,
            queue: null,
        };
    },

    actions: {
        async initForm(id) {
            const response = await callGetFormStoryboard(id);
            console.log("p", response);
        },
    },
});
