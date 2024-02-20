import FileAction from "@/forms/classic/interactions/FileAction.vue";

export function useFileAction(block: PublicFormBlockModel) {
    const useThis = [
        "input-file",
    ].includes(block.type);

    const validator = (input: any) => {

        console.log("input", input)

        return {
            valid: true,
            message: "",
        }
    };

    return { useThis, component: FileAction, validator, props: {} };
}
