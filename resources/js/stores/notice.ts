import { AxiosError } from "axios";
import { defineStore } from "pinia";

interface NoticeStore {
    message: string | null;
}

export const useNotice = defineStore("notice", {
    state: (): NoticeStore => {
        return {
            message: null,
        };
    },

    actions: {
        showSaveError(error: unknown) {
            const response =
                error instanceof AxiosError ? error.response : undefined;

            if (response?.status === 401 || response?.status === 419) {
                this.message =
                    "Your change was not saved: your session has expired. Reload the page and try again.";
            } else if (
                response &&
                response.status < 500 &&
                response.data?.message
            ) {
                this.message = `Your change was not saved: ${response.data.message}`;
            } else {
                this.message =
                    "Your change was not saved. Check your connection and try again.";
            }
        },
    },
});
