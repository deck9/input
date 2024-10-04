import { useForm } from "@/stores";
import { defineStore } from "pinia";

import { callCreateFormBlockLogic } from "@/api/logics";

interface LogicStore {
    block: FormBlockModel | null;
    isShowingLogicEditor: boolean;
    hideRule: FormBlockLogic | null;
}

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

        async saveBlockLogic() {
            if (!this.block) {
                return;
            }

            try {
                console.log("save rules", [this.hideRule]);
                // create new logic on backend
                const response = await callCreateFormBlockLogic(
                    this.block?.id,
                    {
                        ...this.hideRule,
                    },
                );

                if (response.status === 201) {
                    this.hideRule = response.data;
                }
            } catch (error) {
                console.warn(error);
            }
        },

        updateHideRule(
            conditions: Array<EditableFormBlockBlockLogicCondition>,
        ) {
            if (!this.block) {
                return;
            }

            const transformedConditions = conditions.map((c) =>
                transformConditionForBackend(c),
            );

            if (!this.hideRule) {
                this.hideRule = {
                    form_block_id: this.block?.id,
                    name: "Hide block",
                    conditions: transformedConditions,
                    action: "hide",
                    actionPayload: null,
                    evaluate: "before",
                };
            } else {
                this.hideRule.conditions = transformedConditions;
            }
        },
    },

    getters: {
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
