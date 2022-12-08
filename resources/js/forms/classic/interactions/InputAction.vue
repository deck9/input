<template>
  <div class="relative">
    <label class="sr-only block" :for="action.id">{{ action.label }}</label>
    <input
      :type="nativeInputType"
      class="block w-full max-w-xs rounded border border-grey-300 bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      :class="[useIcon ? 'pl-10' : 'pl-3']"
      :name="block.id"
      :id="action.id"
      :placeholder="action.label || 'Enter text'"
      :value="storeValue"
      ref="inputElement"
      autocomplete="off"
      @input="onInput"
      v-once
    />

    <div
      v-if="useIcon"
      class="absolute inset-y-0 left-3 flex items-center text-grey-700"
    >
      <D9Icon :name="useIcon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, inject, onMounted, ref } from "vue";
import { D9Icon } from "@deck9/ui";
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

const useIcon = computed(() => {
  switch (props.block.type) {
    case "input-number":
      return "sort-numeric-up";

    case "input-email":
      return "envelope";

    case "input-link":
      return "link";

    case "input-phone":
      return "phone";

    default:
      return false;
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
