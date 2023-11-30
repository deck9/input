<template>
  <div>
    <label class="sr-only block" :for="action.id"> {{ action.label }}</label>
    <textarea
      class="block min-h-[4rem] w-full max-w-md rounded border border-grey-300 bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      :name="block.id"
      :id="action.id"
      :placeholder="action.label || 'Enter text'"
      :value="storeValue"
      ref="inputElement"
      autocomplete="off"
      :rows="action?.options.rows ?? 5"
      @focus="store.enableInputMode"
      @blur="store.disableInputMode"
      @input="onInput"
      v-once
    >
    </textarea>
    <CharCount
      v-bind="{
        text: inputText,
        maxChars: action.options?.max_chars,
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { ComputedRef, inject, onMounted, onUnmounted, ref } from "vue";
import { useConversation } from "@/stores/conversation";
import CharCount from "@/components/CharCount.vue";

const store = useConversation();

const props = defineProps<{
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();
const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");

const storeValue = (store.currentPayload as FormBlockInteractionPayload)
  ?.payload;

const inputElement = ref<HTMLInputElement | null>(null);
const inputText = ref<string | undefined>(inputElement.value?.value);

onMounted(() => {
  store.enableInputMode();

  if (!disableFocus?.value) {
    inputElement.value?.focus();
  }
});

onUnmounted(() => {
  store.disableInputMode();
});

const onInput = () => {
  const input = inputElement.value?.value;
  inputText.value = input;
  store.setResponse(props.action, input ?? null);
};
</script>
