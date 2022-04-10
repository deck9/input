<template>
  <div
    class="relative flex w-full justify-between overflow-hidden rounded px-2 py-1"
  >
    <div
      class="absolute inset-y-0 left-0 bg-grey-300"
      :style="`width: ${value}%;`"
    ></div>
    <span class="relative font-medium">{{ label }}</span>
    <span class="relative font-medium">{{ formatted }}%</span>
  </div>
</template>

<script lang="ts" setup>
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
</script>
