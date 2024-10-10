import { useForm } from "@/stores";
import { defineStore } from "pinia";

import {
    callCreateFormBlockLogic,
    callUpdateFormBlockLogic,
    callDeleteFormBlockLogic,
} from "@/api/logics";

interface LogicStore {
    block: FormBlockModel | null;
    isShowingLogicEditor: boolean;
    hideRule: FormBlockLogic | null;
}

export const operators: Array<{ key: Operator; label: string }> = [
    { key: "equals", label: "is equal to" },
    { key: "equalsNot", label: "is not equal to" },
    { key: "contains", label: "contains" },
    { key: "containsNot", label: "does not contain" },
    { key: "isLowerThan", label: "is lower than" },
    { key: "isGreaterThan", label: "is greater than" },
];

const transformConditionForBackend = (
    condition: EditableFormBlockBlockLogicCondition,
): FormBlockLogicCondition => {
    return {
        ...condition,
        source: condition.source?.key,
        operator: condition.operator.key,
    };
};

export const useLogic = defineStore("logic", {
    state: (): LogicStore => {
        return {
            block: null,
            isShowingLogicEditor: false,
            hideRule: null,
        };
    },

    actions: {
        showLogicEditor(block: FormBlockModel) {
            this.block = block;
            this.isShowingLogicEditor = true;
        },

        hideLogicEditor() {
            this.block = null;
            this.isShowingLogicEditor = false;
        },

        addRule() {
            if (!this.block) {
                return;
            }

            if (!this.block.logics) {
                this.block.logics = [];
            }

            this.block.logics.push({
                form_block_id: this.block.id,
                name: "Rule #" + (this.block.logics.length + 1),
                action: "hide",
                actionPayload: null,
                evaluate: "before",
                conditions: [],
            });
        },

        async removeRule(index: number) {
            if (!this.block || !this.block.logics) {
                return;
            }

            if (this.block.logics[index].id === undefined) {
                this.block.logics.splice(index, 1);
                return;
            }

            try {
                const response = await callDeleteFormBlockLogic(
                    this.block.logics[index],
                );

                if (response.status === 200) {
                    this.block.logics.splice(index, 1);
                }
            } catch (error) {
                console.warn(`Error deleting rule:`, error);
            }
        },

        async saveBlockLogic() {
            if (!this.block || !this.block.logics) {
                return;
            }

            const results = await Promise.allSettled(
                this.block.logics.map((logic) => this.saveSingleRule(logic)),
            );

            const failedSaves = results.filter(
                (result) => result.status === "rejected",
            );

            if (failedSaves.length > 0) {
                console.warn(`Failed to save ${failedSaves.length} rule(s):`);
                failedSaves.forEach((failure, index) => {
                    if (failure.status === "rejected") {
                        console.warn(
                            `Rule ${index + 1} failed:`,
                            failure.reason,
                        );
                    }
                });
            }

            return {
                failed: failedSaves.length,
                totalRules: this.block.logics.length,
            };
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

        updateBlockLogic(logic: FormBlockLogic, index: number) {
            if (!this.block) {
                return;
            }

            if (!this.block.logics) {
                this.block.logics = [];
            }

            const transformedConditions = logic.conditions.map((c) =>
                transformConditionForBackend(c),
            );

            logic.conditions = transformedConditions;

            this.block.logics[index] = logic;
        },
    },

    getters: {
        allBlocks(): Array<FormBlockModel> | null {
            const formStore = useForm();

            return formStore.blocks;
        },

        availableSourceBlocks(state): Array<FormBlockModel> {
            const formStore = useForm();

            const result: FormBlockModel[] = [];
            let found = false;

            const traverse = (node: TreeNode) => {
                if (found) return;

                result.push(node.block);

                if (node.block.uuid === state.block?.uuid) {
                    found = true;
                    return;
                }

                for (const child of node.children) {
                    traverse(child);
                    if (found) break;
                }
            };

            for (const rootNode of formStore.blocksTree) {
                traverse(rootNode);
                if (found) break;
            }

            // Remove the last element (the found block) from the result
            if (found) {
                result.pop();
            }

            return result;
        },
    },
});
