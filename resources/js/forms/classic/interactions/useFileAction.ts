import FileAction from "@/forms/classic/interactions/FileAction.vue";
import { useI18n } from "vue-i18n";

export function useFileAction(block: PublicFormBlockModel) {
    const { t } = useI18n();
    const useThis = [
        "input-file",
    ].includes(block.type);

    const validator = (input: any) => {

        // check if the block is required
        if (block.is_required && (!input?.payload || input?.payload.length === 0)) {
            return {
                valid: false,
                message: t("validation.field_required"),
            }
        }

        // get constraints from block file interaction
        const interaction = block.interactions.find((interaction) => {
            return interaction.type === "file";
        })

        if (!interaction) {
            return {
                valid: false,
                message: t("No file interaction found"),
            }
        }

        const maxFiles = interaction.options?.allowedFiles;
        const maxFileSize = interaction.options?.allowedFileSize ? interaction.options?.allowedFileSize * Math.pow(10,6) : 0;

        // check for max files constrains
        if (maxFiles && input?.payload.length > maxFiles) {
            return {
                valid: false,
                message: t(`Too many files uploaded`),
            }
        }

        // check for file size constraints
        if (input?.payload && input.payload.length > 0) {
            for (const file of input.payload) {
                // check for max file size
                if (maxFileSize && file.size > maxFileSize) {
                    return {
                        valid: false,
                        message: t(`File size of ${file.name} too large`),
                    }
                }
            }
        }

        return {
            valid: true,
            message: "",
        }
    };

    return { useThis, component: FileAction, validator, props: {} };
}
