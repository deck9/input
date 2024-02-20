<template>
  <div
    class="flex items-center justify-between gap-x-3 bg-grey-100 px-2 py-1 rounded"
  >
    <div class="w-10 h-10 shrink-0" v-if="hasRenderablePreview">
      <img
        class="object-cover w-full h-full"
        :src="renderableImageUrl"
        alt="Preview"
      />
    </div>
    <div class="truncate">
      {{ file.name }}
    </div>
    <div class="whitespace-nowrap text-xs font-mono">{{ file.type }}</div>
    <div class="whitespace-nowrap text-xs font-mono">{{ fileSize }}</div>
    <button type="button" @click="emits('remove')" class="px-2">
      <D9Icon name="times" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { D9Icon } from "@deck9/ui";

const props = defineProps<{
  file: File;
}>();

const emits = defineEmits(["remove"]);

const fileSize = computed(() => {
  let size = props.file.size;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;

  while (size > 1024) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
});

const hasRenderablePreview = computed(() => {
  return ["image"].includes(props.file.type.split("/")[0]);
});

const renderableImageUrl = computed(() => {
  return URL.createObjectURL(props.file);
});

console.log("created", props.file);
</script>
