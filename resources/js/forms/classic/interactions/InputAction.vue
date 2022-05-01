<template>
  <div>
    <label class="sr-only block" :for="action.id"> {{ action.label }}</label>
    <input
      type="text"
      class="block w-full max-w-xs rounded border border-grey-300 bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      :name="block.id"
      :id="action.id"
      :placeholder="action.label || 'Enter text'"
      :value="storeValue"
      ref="inputElement"
      autocomplete="off"
      @input="onInput"
      v-once
    />
  </div>
</template>

<script lang="ts" setup>
import { ComputedRef, inject, onMounted, ref } from "vue";
import { useConversation } from "@/stores/conversation";

const store = useConversation();

const props = defineProps<{
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();
const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");

const storeValue = store.currentPayload?.[props.action.id]?.payload;
const inputElement = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (!disableFocus?.value) {
    inputElement.value?.focus();
  }
});

const onInput = () => {
  const input = inputElement.value?.value ?? null;
  store.setResponse(props.action, input);
};
</script>
