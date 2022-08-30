<template>
  <div>
    <label class="sr-only block" :for="action.id">{{ action.label }}</label>
    <input
      :type="nativeInputType"
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
import { computed, ComputedRef, inject, onMounted, ref } from "vue";
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

// get the input element type based on the action type
const nativeInputType = computed(() => {
  const action: FormBlockType = props.block.type;

  switch (action) {
    case "input-number":
      return "number";

    case "input-email":
      return "email";

    case "input-link":
      return "url";

    case "input-phone":
      return "tel";

    default:
      return "text";
  }
});

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
