<template>
  <label
    :for="action.id"
    class="relative block cursor-pointer rounded border py-2 pl-6 pr-3 focus:border-grey-600 focus:outline-none focus:ring-1 focus:ring-grey-600"
    :class="{
      'border-grey-600 ring-1 ring-grey-600': isChecked,
      'border-grey-300': !isChecked,
    }"
  >
    <div class="absolute inset-y-0 left-2 flex items-center">
      <span
        class="flex h-5 w-5 items-center justify-center rounded-sm text-xs font-medium"
        :class="{
          'bg-grey-600 text-grey-50': isChecked,
          'bg-grey-300': !isChecked,
        }"
        >{{ index + 1 }}</span
      >
    </div>

    <span class="pl-4"> {{ action.label }}</span>
    <div class="absolute inset-y-0 right-4 flex items-center">
      <input
        class="border-grey-800 checked:bg-grey-600 checked:hover:bg-grey-600 focus:ring-grey-600 focus:checked:bg-grey-600 focus:checked:outline-none focus:checked:ring-0 focus:checked:ring-offset-0"
        :type="inputType"
        :name="block.id"
        :id="action.id"
        :value="action.label"
        @input="onInput"
        ref="buttonElement"
        :checked="action.label === modelValue"
      />
    </div>
  </label>
</template>

<script lang="ts" setup>
import { computed } from "@vue/runtime-core";
import { onKeyStroke } from "@vueuse/core";
import { onMounted, ref } from "vue";

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const props = defineProps<{
  modelValue?: string;
  index: number;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();

const inputType = computed(() => {
  if (props.block.type === "checkbox") {
    return "checkbox";
  }

  return "radio";
});

const isChecked = computed<boolean>(() => {
  return props.action.label === props.modelValue;
});
const buttonElement = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (props.index === 0) {
    buttonElement.value?.focus();
  }
});

const onInput = () => {
  buttonElement.value?.focus();
  emit("update:modelValue", props.action.label);
};

const shortcutKey = (props.index + 1).toString();
onKeyStroke(shortcutKey, onInput, { target: document });
</script>
