<template>
  <div
    class="group relative flex cursor-pointer justify-between rounded bg-blue-200 py-1 pl-4 pr-6"
    @click="copyResult"
  >
    <span class="pointer-events-none relative font-medium">{{ label }}</span>
    <span class="relative font-medium">{{ count }}</span>
  </div>
</template>

<script lang="ts" setup>
import copy from "copy-text-to-clipboard";

const props = defineProps<{
  label: string;
  count: number;
}>();

const copyResult = () => {
  copy(`${props.label}: ${props.count}`);
};
</script>
