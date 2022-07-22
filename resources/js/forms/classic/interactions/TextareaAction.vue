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
      @input="onInput"
      v-once
    >
    </textarea>

    <span
      class="text-xs"
      :class="[
        hasMaxChars && charCount > action.options?.max_chars
          ? 'font-medium text-red-600'
          : 'text-grey-600',
      ]"
    >
      {{ charCount }}
      <span v-if="hasMaxChars">/ {{ action.options?.max_chars }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  ComputedRef,
  inject,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import { useConversation } from "@/stores/conversation";

const store = useConversation();

const props = defineProps<{
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();
const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");

const storeValue = (store.currentPayload as FormBlockInteractionPayload)
  ?.payload;

const charCount = ref<number>(0);
const inputElement = ref<HTMLInputElement | null>(null);

onMounted(() => {
  store.disableEnterKey();
  updateCharCount();

  if (!disableFocus?.value) {
    inputElement.value?.focus();
  }
});

onUnmounted(() => {
  store.enableEnterKey();
});

const hasMaxChars = computed(() => {
  return props.action.options?.max_chars > 0;
});

const updateCharCount = () => {
  const input = inputElement.value?.value ?? null;

  if (input) {
    charCount.value = input.length;
  } else {
    charCount.value = 0;
  }
};

const onInput = () => {
  const input = inputElement.value?.value ?? null;
  updateCharCount();
  store.setResponse(props.action, input);
};
</script>
