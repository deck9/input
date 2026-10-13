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

            const save = `removeRule:${this.block.logics[index].id}`;

            try {
                const response = await callDeleteFormBlockLogic(
                    this.block.logics[index],
                );
                useNotice().clearSaveError(save);

                if (response.status === 200) {
                    this.block.logics.splice(index, 1);
                }
            } catch (error) {
                useNotice().showSaveError(error, save, this.block);
            }
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
