import { AxiosError } from "axios";
import { defineStore } from "pinia";
import { getTextFromHtml } from "@/utils";
import { useForm } from "./form";

interface NoticeStore {
    // message per failed save, e.g. "saveInteraction:12", newest last
    failedSaves: Record<string, string>;
    // how to send a failed save again, by the same name
    retries: Record<string, () => Promise<unknown>>;
    // saves that wait for their debounce, and saves that run
    waitingSaves: Record<string, true>;
    runningSaves: number;
    // the owner closed the red bar; a new failure shows it again
    isBarHidden: boolean;
}

export type SaveStatus = "saving" | "failed" | "idle";

const questions = (nodes: TreeNode[]): FormBlockModel[] =>
    nodes.flatMap((node) =>
        node.block.type === "group" ? questions(node.children) : [node.block],
    );

// "question 4 (“Will you come to the…”)", as the editor numbers questions
function questionName(block: FormBlockModel): string {
    if (block.type === "group") {
        return `group “${block.title || "Unnamed group"}”`;
    }

    const text = getTextFromHtml(block.message ?? "").trim();
    const short = text.length > 22 ? `${text.slice(0, 20).trim()}…` : text;
    const quoted = short ? `“${short}”` : "";
    const number =
        questions(useForm().blocksTree).findIndex(
            (item) => item.id === block.id,
        ) + 1;

    if (!number) {
        return quoted;
    }

    return quoted ? `question ${number} (${quoted})` : `question ${number}`;
}

export const useNotice = defineStore("notice", {
    state: (): NoticeStore => {
        return {
            failedSaves: {},
            retries: {},
            waitingSaves: {},
            runningSaves: 0,
            isBarHidden: false,
        };
    },

    getters: {
        message: (state): string | null =>
            Object.values(state.failedSaves).at(-1) ?? null,

        saveStatus: (state): SaveStatus => {
            if (state.runningSaves || Object.keys(state.waitingSaves).length) {
                return "saving";
            }

            return Object.keys(state.failedSaves).length ? "failed" : "idle";
        },

        canRetry: (state): boolean => Object.keys(state.retries).length > 0,
    },

    actions: {
        waitForSave(save: string) {
            this.waitingSaves[save] = true;
        },

        // runs a save, and keeps it to send again if it fails. A failed
        // change "wasn't saved"; an action says what else failed, e.g. "duplicated"
        async send<T>(
            save: string,
            request: () => Promise<T>,
            block?: FormBlockModel | null,
            action?: string,
        ): Promise<T | undefined> {
            delete this.waitingSaves[save];
            this.runningSaves++;

            try {
                const result = await request();
                this.clearSaveError(save);

                return result;
            } catch (error) {
                this.showSaveError(error, save, block, action);
                this.retries[save] = () =>
                    this.send(save, request, block, action);
            } finally {
                this.runningSaves--;
            }
        },

        retrySaves() {
            const retries = Object.values(this.retries);

            // a second click while they run would send them twice
            this.retries = {};
            retries.forEach((retry) => retry());
        },

        showSaveError(
            error: unknown,
            save: string,
            block?: FormBlockModel | null,
            action?: string,
        ) {
            const name = block ? questionName(block) : "";
            const failed = action
                ? `${name.charAt(0).toUpperCase()}${name.slice(1)} couldn't be ${action}`
                : `Your change${name ? ` to ${name}` : ""} wasn't saved`;
            const response =
                error instanceof AxiosError ? error.response : undefined;

            // delete first, so a repeated failure moves to the end and shows
            delete this.failedSaves[save];
            this.isBarHidden = false;

            if (response?.status === 401 || response?.status === 419) {
                this.failedSaves[save] =
                    `${failed}: your session has expired. Reload the page and try again.`;
            } else if (
                response &&
                response.status < 500 &&
                response.data?.message
            ) {
                this.failedSaves[save] =
                    `${failed}: ${response.data.message}`;
            } else {
                this.failedSaves[save] =
                    `${failed}. Check your connection and try again.`;
            }
        },

        clearSaveError(save: string) {
            delete this.failedSaves[save];
            delete this.retries[save];
        },
    },
});
