<template>
  <button
    :class="[
      'rounded px-3 mx-px py-1 relative text-sm',
      isActive
        ? 'bg-grey-300 text-grey-700'
        : 'text-grey-500 hover:bg-grey-200 bg-white',
    ]"
    v-tooltip="{ content: label, placement: 'top' }"
  >
    <D9Icon :name="icon" />
    <small
      v-if="subLabel"
      class="absolute bottom-1 text-xs font-bold leading-none rounded-full"
      >{{ subLabel }}</small
    >
  </button>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";

defineProps<{
  isActive: boolean;
  icon: string;
  label: string;
  subLabel?: string;
}>();
</script>
