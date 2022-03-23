<template>
  <div>
    <label class="sr-only block" :for="action.id"> {{ action.label }}</label>
    <input
      type="text"
      class="block w-full max-w-xs rounded border border-grey-300 focus:border-grey-600 focus:outline-none focus:ring-1 focus:ring-grey-600"
      :name="block.id"
      :id="action.id"
      :placeholder="action.label || 'Enter text'"
      :value="modelValue"
      ref="inputElement"
      autocomplete="off"
      @input="onInput"
      v-once
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

defineProps<{
  modelValue?: string;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();

const inputElement = ref<HTMLInputElement | null>(null);

onMounted(() => {
  inputElement.value?.focus();
});

const onInput = () => {
  emit("update:modelValue", inputElement.value?.value ?? null);
};
</script>
