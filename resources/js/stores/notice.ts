import { AxiosError } from "axios";
import { defineStore } from "pinia";

interface NoticeStore {
    // message per failed save, e.g. "saveInteraction:12", newest last
    failedSaves: Record<string, string>;
}

export const useNotice = defineStore("notice", {
    state: (): NoticeStore => {
        return {
            failedSaves: {},
        };
    },

    getters: {
        message: (state): string | null =>
            Object.values(state.failedSaves).at(-1) ?? null,
    },

    actions: {
        showSaveError(
            error: unknown,
            save: string,
            block?: FormBlockModel | null,
        ) {
            const change = block
                ? `Your change to "${block.title || block.uuid}"`
                : "Your change";
            const response =
                error instanceof AxiosError ? error.response : undefined;

            // delete first, so a repeated failure moves to the end and shows
            delete this.failedSaves[save];

            if (response?.status === 401 || response?.status === 419) {
                this.failedSaves[save] =
                    `${change} was not saved: your session has expired. Reload the page and try again.`;
            } else if (
                response &&
                response.status < 500 &&
                response.data?.message
            ) {
                this.failedSaves[save] =
                    `${change} was not saved: ${response.data.message}`;
            } else {
                this.failedSaves[save] =
                    `${change} was not saved. Check your connection and try again.`;
            }
        },

        clearSaveError(save: string) {
            delete this.failedSaves[save];
        },
    },
});
