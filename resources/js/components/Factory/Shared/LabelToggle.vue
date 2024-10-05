<template>
  <div class="font-mono uppercase text-xs tracking-widest text-blue-700">
    <span v-for="(option, index) in options" :key="option.value">
      <input
        :id="`label-toggle-${uid}-${index}`"
        type="radio"
        class="uppercase appearance-none peer hidden"
        :class="`peer`"
        :name="`label-toggle-${uid}`"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="updateValue(option.value)"
      />
      <label
        class="cursor-pointer text-grey-300"
        :class="`peer-checked:text-blue-700 peer-checked:font-bold`"
        :for="`label-toggle-${uid}-${index}`"
        >{{ option.label }}</label
      >
      <span class="mx-1" v-if="index < options.length - 1">/</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from "vue";

const instance = getCurrentInstance();
const uid = instance?.uid;

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

interface ToggleOption {
  label: string;
  value: string;
}

withDefaults(
  defineProps<{
    modelValue: string;
    options: ToggleOption[];
  }>(),
  {
    options: () => [
      { label: "True", value: "1" },
      { label: "False", value: "0" },
    ],
  },
);

const updateValue = (value: string) => {
  emit("update:modelValue", value);
};
</script>
