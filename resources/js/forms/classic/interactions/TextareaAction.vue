<template>
  <div>
    <label class="sr-only block" :for="action.id"> {{ action.label }}</label>
    <textarea
      class="block w-full max-w-md rounded border border-grey-300 bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
  </div>
</template>

<script lang="ts" setup>
import { ComputedRef, inject, onMounted, onUnmounted, ref } from "vue";
import { useConversation } from "@/stores/conversation";

const store = useConversation();

const props = defineProps<{
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();
const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");

const storeValue = (store.currentPayload as FormBlockInteractionPayload)
  ?.payload;

const inputElement = ref<HTMLInputElement | null>(null);

onMounted(() => {
  store.disableEnterKey();

  if (!disableFocus?.value) {
    inputElement.value?.focus();
  }
});

onUnmounted(() => {
  store.enableEnterKey();
});

const onInput = () => {
  const input = inputElement.value?.value ?? null;
  store.setResponse(props.action, input);
};
</script>
