<template>
  <div>
    <label class="block" :for="action.id"> {{ action.label }}</label>
    <input
      type="text"
      :name="block.id"
      :id="action.id"
      :placeholder="action.label || 'Enter text'"
      v-model="inputValue"
      ref="inputElement"
      autocomplete="off"
      @input="onInput"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from "vue";

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

defineProps<{
  modelValue?: string;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();

const inputElement: Ref<HTMLInputElement> = ref(
  null
) as unknown as Ref<HTMLInputElement>;
const inputValue: Ref<string> = ref("");

onMounted(() => {
  inputElement.value.focus();
});

const onInput = () => {
  emit("update:modelValue", inputValue.value);
};
</script>
