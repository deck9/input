<template>
  <div
    class="absolute inset-y-2 -left-24 flex w-24 items-center justify-end space-x-2 pr-2 text-grey-400 opacity-0 transition duration-200 group-hover:opacity-100"
  >
    <button
      tabindex="-1"
      class="hover:text-grey-600"
      @click="$emit('onDelete')"
    >
      <D9Icon name="trash" />
    </button>
    <button tabindex="-1" class="handle hover:text-grey-600">
      <D9Icon name="grip-vertical" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";

defineEmits<{
  (e: "onDelete"): void;
}>();
</script>
