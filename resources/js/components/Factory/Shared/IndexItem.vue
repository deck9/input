<template>
  <div
    class="relative flex h-5 w-6 items-center justify-center rounded-md bg-grey-700 text-xs text-white"
    :style="indexColor"
  >
    <D9Icon v-if="iconName" :name="iconName" />
    <span class="font-mono text-xs font-bold" v-else>{{ indexLetter }}</span>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import { D9Icon } from "@deck9/ui";
import { alphabetize } from "@/utils";
import { useBlockTypes } from "@/components/Factory/utils/useBlockTypes";
const { types } = useBlockTypes();

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

const block: FormBlockModel | undefined = inject("block");

const props = withDefaults(
  defineProps<{
    type: FormBlockInteractionModel["type"];
    index?: number;
    showColors?: boolean;
  }>(),
  {
    showColors: true,
  },
);

const iconName = computed((): string | false => {
  const found = types.value?.find((setting) => {
    return setting?.value === block?.type;
  });

  switch (props.type) {
    case "button":
      return false;

    default:
      return found && found.icon ? found.icon : false;
  }
});

const indexLetter = computed((): string => {
  if (typeof props.index !== "undefined") {
    return alphabetize(props.index);
  }

  return "-";
});

const indexColor = computed((): string => {
  if (!props.showColors) {
    return "";
  }

  if (typeof props.index !== "undefined" && props.type === "button") {
    return `background-color: #${colors[props.index % colors.length]};`;
  }

  return "";
});
</script>
