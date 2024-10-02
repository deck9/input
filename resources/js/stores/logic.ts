import { useForm } from "@/stores";
import { defineStore } from "pinia";

interface LogicStore {
    block: FormBlockModel | null;
    isShowingLogicEditor: boolean;
}

export const useLogic = defineStore("logic", {
    state: (): LogicStore => {
        return {
            block: null,
            isShowingLogicEditor: false,
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

        saveBlockLogic() {
            console.log("save block logic");
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
