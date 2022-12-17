<template>
  <div
    class="inline-block whitespace-nowrap rounded border px-2 py-px text-xs"
    :class="[colorClasses]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  color: "green" | "yellow" | "grey" | "black";
}>();

const colorClasses = computed(() => {
  return {
    "border-green-300 bg-green-50 text-green-700": props.color === "green",
    "border-yellow-300 bg-yellow-50 text-yellow-700": props.color === "yellow",
    "border-grey-400 bg-grey-200 text-grey-800": props.color === "grey",
    "border-black bg-grey-900 text-white": props.color === "black",
  };
});
</script>
