<template>
  <div
    class="mb-4"
    role="group"
    aria-labelledby="file-types-label"
    aria-describedby="file-types-help"
  >
    <D9Label id="file-types" label="File types" />
    <div
      v-for="fileType in availableFileTypes"
      :key="fileType.key"
      class="flex min-h-11 items-center lg:min-h-0"
    >
      <D9Checkbox
        :id="'check' + fileType.key"
        v-model="allowedFileTypes[fileType.key]"
        :label="fileType.label"
      />
    </div>
    <p id="file-types-help" class="mt-1 text-xs text-grey-600">
      None ticked: all types allowed.
    </p>
  </div>

  <div class="mb-4">
    <D9Label
      id="file-max-files"
      label="Most files"
      :description="`1 to ${maxFiles}`"
    />
    <D9Input
      id="file-max-files"
      type="number"
      :min="1"
      :max="maxFiles"
      step="1"
      block
      v-model="allowedFiles"
    />
  </div>

  <div class="mb-4">
    <D9Label
      id="file-max-size"
      label="Largest file (MB)"
      :description="`Up to ${maxFileSize} MB per file`"
    />
    <D9Input
      id="file-max-size"
      type="number"
      :min="1"
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
import { Ref, ref, onMounted } from "vue";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";
import { clampInteger } from "@/utils";
import { useSettingsWatch } from "../utils/useSettingsWatch";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const maxFiles = 10;
const maxFileSize = 8;

const availableFileTypes = [
  { label: "Image", key: "image" },
  { label: "Audio", key: "audio" },
  { label: "Video", key: "video" },
  { label: "Document", key: "text" },
];

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const allowedFileTypes = ref<Record<string, boolean>>({});
const allowedFiles = ref(1);
const allowedFileSize = ref(4);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  if (workbench.block?.interactions) {
    const isNew = !workbench.block.interactions.some(
      (item) => item.type === "file",
    );
    interaction.value = await findOrCreate("file", workbench);

    label.value = interaction.value.label;
    allowedFileTypes.value =
      interaction.value.options?.allowedFileTypes &&
      !Array.isArray(interaction.value.options?.allowedFileTypes)
        ? interaction.value.options?.allowedFileTypes
        : {};
    allowedFiles.value = interaction.value.options?.allowedFiles ?? 1;
    allowedFileSize.value = interaction.value.options?.allowedFileSize ?? 4;
    await settled(isNew);
  }
});

const settled = useSettingsWatch(
  [
    label,
    () => allowedFileTypes.value.image,
    () => allowedFileTypes.value.video,
    () => allowedFileTypes.value.audio,
    () => allowedFileTypes.value.text,
    allowedFiles,
    allowedFileSize,
  ],
  () => {
  workbench.updateInteraction({
    id: interaction.value.id,
    label: label.value,
    options: {
      allowedFileTypes: {
        image: allowedFileTypes.value.image,
        video: allowedFileTypes.value.video,
        audio: allowedFileTypes.value.audio,
        text: allowedFileTypes.value.text,
      },
      allowedFiles: clampInteger(allowedFiles.value, 1, maxFiles),
      allowedFileSize: clampInteger(allowedFileSize.value, 1, maxFileSize),
    },
  });
  },
);
</script>
