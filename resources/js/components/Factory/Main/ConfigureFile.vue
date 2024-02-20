<template>
  <div class="mb-4">
    <D9Label label="Allowed File Types" />
    <div v-for="fileType in availableFileTypes" :key="fileType.key">
      <D9Checkbox
        :id="'check' + fileType.key"
        v-model:checked="allowedFileTypes[fileType.key]"
        :label="fileType.label"
      />
    </div>
  </div>

  <div class="mb-4">
    <D9Label
      label="Max Files"
      :description="`The maximum number of allowed files to upload (max. ${maxFiles})`"
    />
    <D9Input
      :placeholder="`The maximum number of allowed files to upload (max. ${maxFiles})`"
      type="number"
      min="1"
      :max="maxFiles"
      step="1"
      block
      v-model="allowedFiles"
    />
  </div>

  <div class="mb-4">
    <D9Label
      label="Max Filesize"
      :description="`The maximum file size in MB (max. ${maxFileSize} MB per file)`"
    />
    <D9Input
      :placeholder="`The maximum file size in MB (max. ${maxFileSize} MB per file)`"
      type="number"
      min="1"
      :max="maxFileSize"
      step="1"
      block
      v-model="allowedFileSize"
    />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Checkbox, D9Input } from "@deck9/ui";
import { watch, Ref, ref, onMounted } from "vue";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const maxFiles = 10;
const maxFileSize = 16;

const availableFileTypes = [
  { label: "Image", key: "image" },
  { label: "Audio", key: "audio" },
  { label: "Video", key: "video" },
  { label: "Document", key: "documents" },
];

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const allowedFileTypes = ref<Record<string, boolean>>({});
const allowedFiles = ref(1);
const allowedFileSize = ref(4);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  if (workbench.block?.interactions) {
    interaction.value = await findOrCreate("file", workbench);

    label.value = interaction.value.label;
    allowedFileTypes.value = interaction.value.options?.allowedFileTypes ?? {};
    allowedFiles.value = interaction.value.options?.allowedFiles ?? 1;
    allowedFileSize.value = interaction.value.options?.allowedFileSize ?? 4;
  }
});

watch(
  [label, allowedFileTypes, allowedFiles, allowedFileSize],
  (newValues: any[]) => {
    const update = {
      id: interaction.value.id,
      label: newValues[0],
      options: {
        allowedFileTypes: newValues[1] ? newValues[1] : undefined,
        allowedFiles: newValues[2] ? parseInt(newValues[2]) : undefined,
        allowedFileSize: newValues[3] ? parseInt(newValues[3]) : undefined,
      },
    };

    workbench.updateInteraction(update);
  },
);
</script>
