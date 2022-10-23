<template>
  <div
    class="group relative flex w-full cursor-pointer justify-between overflow-hidden rounded px-2 py-1"
    @click="copySubmission"
  >
    <div
      class="absolute inset-y-0 left-0 bg-blue-300 transition-colors duration-150 group-hover:bg-blue-200"
      :style="`width: ${value}%;`"
    ></div>
    <span class="pointer-events-none relative font-medium">{{ label }}</span>
    <span class="relative font-medium">{{ formatted }}%</span>
  </div>
</template>

<script lang="ts" setup>
import copy from "copy-text-to-clipboard";
import { useFormattedNumber } from "@/utils/useFormattedNumber";

const props = defineProps<{
  label: string;
  count: number;
  total: number;
}>();

const { formatted, value } = useFormattedNumber(
  (props.count / props.total) * 100,
  navigator.language
);

const copySubmission = () => {
  copy(`${props.label}: ${formatted.value}%`);
};
</script>
