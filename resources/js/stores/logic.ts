import { defineStore } from "pinia";
import { useNotice } from "./notice";

import {
    callCreateFormBlockLogic,
    callUpdateFormBlockLogic,
    callDeleteFormBlockLogic,
} from "@/api/logics";

// the block whose rules are saved or removed
interface LogicStore {
    block: FormBlockModel | null;
}

export const useLogic = defineStore("logic", {
    state: (): LogicStore => {
        return {
            block: null,
        };
    },

    actions: {
        async removeRule(index: number) {
            if (!this.block || !this.block.logics) {
                return;
            }

            if (this.block.logics[index].id === undefined) {
                this.block.logics.splice(index, 1);
                return;
            }

            // a retry removes this rule, even after the logic editor closed
            const block = this.block;
            const logics = this.block.logics;
            const logic = logics[index];

            const request = async () => {
                const response = await callDeleteFormBlockLogic(logic);

                if (response.status === 200 && logics.includes(logic)) {
                    logics.splice(logics.indexOf(logic), 1);
                }
            };

            await useNotice().send(`removeRule:${logic.id}`, request, block);
        },

        async saveSingleRule(logic: FormBlockLogic) {
            if (!this.block) {
                throw new Error("Block is not defined");
            }

            try {
                if (!logic.uuid) {
                    const response = await callCreateFormBlockLogic(
                        this.block.id,
                        logic,
                    );
                    if (response.status === 201) {
                        return response.data;
                    } else {
                        throw new Error(
                            `Unexpected response status: ${response.status}`,
                        );
                    }
                } else {
                    const response = await callUpdateFormBlockLogic(logic);

                    if (response.status === 200) {
                        return response.data;
                    } else {
                        throw new Error(
                            `Unexpected response status: ${response.status}`,
                        );
                    }
                }
            } catch (error) {
                console.warn(`Error saving rule:`, error);
                throw error;
            }
        },
    },
});
