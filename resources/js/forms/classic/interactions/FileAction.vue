<template>
  <div class="relative max-w-md">
    <div
      class="border-2 border-dashed border-primary rounded px-4 py-10 text-center"
      :class="isOverDropZone ? 'border-content/20' : 'border-primary'"
      ref="dropZoneRef"
    >
      <button
        @click="open()"
        type="button"
        class="underline text-primary px-5 py-1 rounded"
      >
        Choose Files
      </button>
      <span class="block text-xs text-content/80 leading-0">or drop here</span>
    </div>

    <pre>{{ storeValue }}</pre>
    <pre>{{ isOverDropZone }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { useConversation } from "@/stores/conversation";
import { useFileDialog, useDropZone } from "@vueuse/core";
import { ref } from "vue";

const store = useConversation();

const storeValue = (store.currentPayload as FormBlockInteractionPayload)
  ?.payload;

const dropZoneRef = ref<HTMLDivElement>();

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: function (files: File[] | null) {
    console.log(files);
  },
});

console.log(dropZoneRef, isOverDropZone);

const { open, onChange } = useFileDialog({
  multiple: true,
  accept: "image/*",
});

onChange((files) => {
  console.log(files);
});
</script>
