<template>
  <div
    class="relative flex h-5 w-6 items-center justify-center rounded-md bg-blue-600 text-xs text-white"
    :style="indexColor"
  >
    <D9Icon v-if="iconName" :name="iconName" />
    <span class="font-mono text-xs font-bold" v-else>{{ indexLetter }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { D9Icon } from "@deck9/ui";
import { alphabetize } from "@/utils";

const colors = [
  "3c92dd",
  "005f73",
  "0a9396",
  "e86a92",
  "ca6702",
  "bb3e03",
  "ae2012",
  "a5211c",
];

const props = defineProps<{
  type: FormBlockInteractionModel["type"];
  index?: number;
}>();

const iconName = computed((): string | false => {
  switch (props.type) {
    case "input":
      return "envelope";
    default:
      return false;
  }
});

const indexLetter = computed((): string => {
  if (typeof props.index !== "undefined") {
    return alphabetize(props.index);
  }

  return "-";
});

const indexColor = computed((): string => {
  if (typeof props.index !== "undefined" && props.type === "click") {
    return `background-color: #${colors[props.index % colors.length]};`;
  }

  return "";
});
</script>
