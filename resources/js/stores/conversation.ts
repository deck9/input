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
    current: PublicFormBlockModel["id"] | null;
    payload: FormSubmitPayload;
    isProcessing: boolean;
    isSubmitted: boolean;
    isInputMode: boolean;
    uploads: FormFileUploads;
};

function createFlatQueue(
    blocks: PublicFormBlockModel[],
    parent_block: string | null = null,
): PublicFormBlockModel[] {
    return blocks
        .filter((block) => block.parent_block === parent_block)
        .flatMap((block) => {
            const queueItem = block;
            if (block.type === "group") {
                const children = blocks.filter(
                    (b) => b.parent_block === block.id,
                );
                return [queueItem, ...createFlatQueue(children, block.id)];
            }
            return [queueItem];
        });
}

function evaluateCondition(
    condition: FormBlockLogicCondition,
    responseValue: any,
): boolean {
    switch (condition.operator) {
        case "equals":
            return responseValue === condition.value;
        case "equalsNot":
            return responseValue !== condition.value;
        case "contains":
            return responseValue.includes(condition.value);
        case "containsNot":
            return !responseValue.includes(condition.value);
        case "isLowerThan":
            return responseValue < condition.value;
        case "isGreaterThan":
            return responseValue > condition.value;
        default:
            return false;
    }
}

function getResponseValue(response: any): any {
    return "payload" in response
        ? response.payload
        : response.map((p) => p.payload).join(", ");
}

function groupConditions(
    evaluatedConditions: FormBlockLogicCondition[],
): FormBlockLogicCondition[][] {
    const groups: FormBlockLogicCondition[][] = [];
    let currentIndex = 0;

    evaluatedConditions.forEach((condition, index) => {
        if (index === 0) {
            groups[currentIndex] = [condition];
        } else {
            if (condition.chainOperator === "or") {
                currentIndex++;
            }
            if (!groups[currentIndex]) {
                groups[currentIndex] = [];
            }
            groups[currentIndex].push(condition);
        }
    });

    return groups;
}

function evaluateConditions(
    conditions: FormBlockLogicCondition[],
    responses: FormSubmitPayload,
): FormBlockLogicCondition[] {
    return conditions.map((condition) => ({
        ...condition,
        result:
            condition.source && responses[condition.source]
                ? evaluateCondition(
                      condition,
                      getResponseValue(responses[condition.source]),
                  )
                : false,
    }));
}

function evaluateLogicRule(
    logic: FormBlockLogic,
    responses: FormSubmitPayload,
): boolean {
    const evaluatedConditions = evaluateConditions(
        logic.conditions as FormBlockLogicCondition[],
        responses,
    );
    const conditionGroups = groupConditions(evaluatedConditions);

    const finalResult = conditionGroups.some((group) =>
        group.every((condition) => condition.result),
    );

    return logic.action === "show" ? finalResult : !finalResult;
}

function isBlockVisible(
    block: PublicFormBlockModel,
    responses: FormSubmitPayload,
): boolean {
    if (!block.logics?.length) {
        return true;
    }

    const beforeLogics = block.logics.filter(
        (logic) =>
            logic.evaluate === "before" ||
            logic.action === "show" ||
            logic.action === "hide",
    );

    // If any logic rule returns false, the block is not visible
    return beforeLogics.every((logic) => evaluateLogicRule(logic, responses));
}

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: undefined,
            session: undefined,
            storyboard: null,
            queue: null,
            current: null,
            payload: {},
            isProcessing: false,
            isSubmitted: false,
            isInputMode: false,
            uploads: {},
        };
    },

    getters: {
        isFirstBlock(): boolean {
            if (!this.processedQueue) {
                return false;
            }

            return this.currentBlockIndex === 0;
        },

        isLastBlock(): boolean {
            if (!this.processedQueue) {
                return false;
            }

            return this.currentBlockIndex + 1 >= this.processedQueue.length;
        },

        processedQueue(state): PublicFormBlockModel[] {
            if (!state.queue) {
                return [];
            }

            return state.queue
                .filter((block) => isBlockVisible(block, state.payload))
                .filter((block) => block.type !== "group");
        },

        currentBlockIndex(state): number {
            return this.processedQueue.findIndex(
                (block) => block.id === state.current,
            );
        },

        currentBlock(): PublicFormBlockModel | null {
            if (!this.processedQueue || !this.processedQueue.length) {
                return null;
            }

            if (this.currentBlockIndex === -1) {
                return null;
            }

            try {
                return this.processedQueue[this.currentBlockIndex];
            } catch (e) {
                console.warn("Current block not found in processed queue", e);
                return null;
            }
        },

        currentPayload(
            state,
        ): FormBlockInteractionPayload | FormBlockInteractionPayload[] | null {
            if (!state.current) return null;

            if (state.payload[state.current]) {
                return state.payload[state.current];
            }

            return null;
        },

        submittablePayload(): FormSubmitPayload {
            const submittablePayload = Object.assign({}, this.payload);

            for (const block in this.payload) {
                const blockPayload = this.payload[block];

                if (Array.isArray(blockPayload)) {
                    continue;
                }

                if (
                    Array.isArray(blockPayload.payload) &&
                    blockPayload.payload.some((f) => f instanceof File)
                ) {
                    submittablePayload[block] = {
                        ...blockPayload,
                        payload: blockPayload.payload
                            .map((f) => f.name)
                            .join(", "),
                    };
                }
            }

            return submittablePayload;
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
                    Object.keys(state.payload).length > 0,
            );
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

        uploadsPayload(state): Record<string, FormBlockUploadPayload> {
            const uploads = {};

            for (const block in state.payload) {
                const blockPayload = state.payload[block];

                if (Array.isArray(blockPayload)) {
                    continue;
                }

                if (
                    Array.isArray(blockPayload.payload) &&
                    blockPayload.payload.some((f) => f instanceof File)
                ) {
                    uploads[block] = blockPayload;
                }
            }

            return uploads;
        },

        hasFileUploads(state): boolean {
            return Object.values(state.payload).some((block) => {
                if (!Array.isArray(block) && Array.isArray(block.payload)) {
                    return block.payload.some((p) => {
                        return p instanceof File;
                    });
                }
            });
        },

        uploadProgress(state): number | false {
            if (Object.values(state.uploads).length === 0) {
                return false;
            }

            const total = Object.values(state.uploads).reduce(
                (acc, val) => acc + val.total,
                0,
            );

            const loaded = Object.values(state.uploads).reduce(
                (acc, val) => acc + val.loaded,
                0,
            );

            return Math.min(100, Math.round((loaded / total) * 100));
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
                try {
                    const response = await callGetForm(id);
                    this.form = response.data;
                } catch (error) {
                    console.warn(error);
                    return;
                }
            }

            const [formSessionResponse, storyboardResponse] = await Promise.all(
                [callCreateFormSession(id, params), callGetFormStoryboard(id)],
            );

            this.session = formSessionResponse.data;
            this.storyboard = storyboardResponse.data.blocks;

            this.queue = createFlatQueue(this.storyboard);

            this.current = this.processedQueue[0].id ?? null;
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
            if (!this.current) return;

            this.payload[this.current] = {
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
            keepChecked: boolean | null = null,
        ) {
            if (!this.current) return;

            const givenPayload = {
                payload: value,
                actionId: action.id,
            };
            const currentPayload = this.payload[this.current];

            if (!Array.isArray(currentPayload)) {
                this.payload[this.current] = [givenPayload];
            } else {
                const foundIndex = currentPayload.findIndex(
                    (p) => p.actionId === action.id,
                );

                if (foundIndex === -1) {
                    currentPayload.push(givenPayload);
                } else {
                    if (keepChecked) {
                        currentPayload.splice(foundIndex, 1, givenPayload);
                    } else {
                        currentPayload.splice(foundIndex, 1);
                    }
                }
            }
        },

        goToIndex(index: number) {
            if (index >= 0 && index < this.processedQueue.length) {
                this.current = this.processedQueue[index].id;
            } else {
                console.warn("Index out of bounds", index);
            }
        },

        back() {
            if (this.isFirstBlock) {
                return;
            }

            this.goToIndex(this.currentBlockIndex - 1);
        },

        /**
         * Increases current block by one or submits form if last block is triggered.
         * @returns {Promise<boolean>}
         */
        async next(): Promise<boolean> {
            if (this.isLastBlock) {
                this.uploads = {};
                this.isProcessing = true;

                if (this.form?.uuid && this.session?.token) {
                    await callSubmitForm(
                        this.form.uuid,
                        this.session.token,
                        this.submittablePayload,
                        this.hasFileUploads,
                    );

                    if (this.hasFileUploads) {
                        // init file upload state
                        this.initFileUpload();

                        // upload files
                        await callUploadFiles(
                            this.form.uuid,
                            this.session.token,
                            this.uploadsPayload,
                            (action, progressEvent) => {
                                try {
                                    this.uploads[action].loaded =
                                        progressEvent.loaded;
                                } catch (e) {
                                    console.warn(
                                        "could not update upload progress",
                                        e,
                                    );
                                }
                            },
                        );

                        await callSubmitForm(
                            this.form.uuid,
                            this.session.token,
                            null,
                            false,
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
                this.goToIndex(this.currentBlockIndex + 1);

                return Promise.resolve(false);
            }
        },

        initFileUpload() {
            Object.values(this.uploadsPayload).forEach((value) => {
                value.payload.forEach((file: File, index: number) => {
                    this.uploads[`${value.actionId}[${index}]`] = {
                        total: file.size,
                        loaded: 0,
                    };
                });
            });
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
