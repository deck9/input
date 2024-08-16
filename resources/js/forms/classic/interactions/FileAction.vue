<template>
  <div class="relative">
    <div
      v-if="!hasMaxFiles"
      class="border-2 border-dashed rounded px-4 text-center transition-all"
      :class="[
        isOverDropZone ? 'border-content/20 py-10' : 'border-content/50',
        !isOverDropZone && !!currentFiles ? 'py-2' : 'py-10',
      ]"
      ref="dropZoneRef"
    >
      <button
        @click="open()"
        type="button"
        class="underline text-content px-5 py-1 rounded"
      >
        {{ t("files_choose") }}
      </button>
      <span class="block text-xs text-content/80 leading-0">{{
        t("files_drop")
      }}</span>
    </div>

    <div v-if="currentFiles" class="my-4 space-y-2">
      <TransitionGroup
        appear
        enter-from-class="-translate-x-8 opacity-0"
        enter-to-class="translate-x-0"
        enter-active-class="transition-all duration-300"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-8 opacity-0"
        leave-active-class="transition-all duration-200"
      >
        <UploadFileItem
          v-for="(file, index) in currentFiles"
          @remove="removeFile(index)"
          :key="file.name"
          :file="file"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useConversation } from "@/stores/conversation";
import { useFileDialog, useDropZone } from "@vueuse/core";
import UploadFileItem from "@/forms/classic/components/UploadFileItem.vue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const store = useConversation();
const { t } = useI18n();

const props = defineProps<{
  index: number;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();

const emit = defineEmits<{
  (event: "update"): void;
}>();

const dropZoneRef = ref<HTMLDivElement>();

const currentFiles = computed<File[] | false>(() => {
  if (
    !Array.isArray(store.currentPayload) &&
    store.currentPayload?.payload.length > 0
  ) {
    return store.currentPayload?.payload;
  }

  return false;
});

const setFiles = (files: File[] | FileList | null) => {
  const currentFiles: File[] = [];

  // first load the current files if any. that are files that have been selected before
  if (!Array.isArray(store.currentPayload) && store.currentPayload?.payload) {
    for (const file of store.currentPayload.payload) {
      currentFiles.push(file);
    }
  }

  // add the new files, that are valid
  if (files) {
    for (const file of files) {
      // validate first if file type is allowed
      // validate second that files names are unique
      if (
        currentFiles.every(
          (currentFile) =>
            currentFile.name !== file.name ||
            currentFile.type !== file.type ||
            currentFile.size !== file.size,
        ) &&
        allowedFileTypes.value
          .split(",")
          .some(
            (mimeType) =>
              mimeType === "*" ||
              file.type === mimeType ||
              (mimeType.endsWith("/*") &&
                file.type.startsWith(mimeType.slice(0, -1))),
          )
      ) {
        currentFiles.push(file);
      } else {
        // if validation fails, log an error and show it to the user
        console.error("File type not allowed");
      }
    }
  }

  // set them as response
  store.setResponse(props.action, currentFiles);
  emit("update");
};

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: setFiles,
});

const allowedFileTypes = computed<string>(() => {
  const types = props.action?.options?.allowedFileTypes;

  const map = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
    text: "application/*,text/*",
  };

  if (types) {
    let accept: string[] = [];
    Object.keys(types).forEach((key) => {
      if (key in types && types[key] === true && key in map) {
        accept.push(map[key]);
      }
    });

    if (accept.length === 0) {
      return "*";
    }

    return accept.join(", ");
  }

  return "*";
});

const hasMaxFiles = computed<boolean>(() => {
  if (props.action?.options?.allowedFiles) {
    return (
      currentFiles.value &&
      currentFiles.value.length >= props.action.options.allowedFiles
    );
  }

  return false;
});

const { open, onChange } = useFileDialog({
  multiple: true,
  accept: allowedFileTypes.value,
});

onChange(setFiles);

const removeFile = (index: number) => {
  const currentFiles: File[] = [];

  // first load the current files
  if (!Array.isArray(store.currentPayload) && store.currentPayload?.payload) {
    for (const file of store.currentPayload.payload) {
      currentFiles.push(file);
    }
  }

  // then remove the file
  currentFiles.splice(index, 1);

  // set them as response
  store.setResponse(props.action, currentFiles);
};
</script>
