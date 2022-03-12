<template>
  <div>
    <input
      :type="inputType"
      :name="block.id"
      :id="action.id"
      :value="action.label"
      @input="onInput"
      ref="buttonElement"
      :checked="action.label === modelValue"
    />
    <label :for="action.id"> {{ action.label }}</label>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "@vue/runtime-core";
import { onMounted, Ref, ref } from "vue";

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

const buttonElement: Ref<HTMLInputElement> = ref(
  null
) as unknown as Ref<HTMLInputElement>;

onMounted(() => {
  if (props.index === 0) {
    buttonElement.value.focus();
  }
});

const onInput = () => {
  emit("update:modelValue", props.action.label);
};
</script>
