<template>
  <label
    :for="action.id"
    class="relative block cursor-pointer rounded border py-2 pl-6 pr-3"
    :class="{
      'border-primary ring-1 ring-primary': isChecked,
      'border-grey-300': !isChecked,
    }"
  >
    <div class="absolute inset-y-0 left-2 flex items-center">
      <span
        class="flex h-5 w-5 items-center justify-center rounded-sm text-xs font-medium"
        :class="{
          'bg-primary text-contrast': isChecked,
          'bg-grey-300': !isChecked,
        }"
        >{{ index + 1 }}</span
      >
    </div>

    <span class="pl-4"> {{ action.label }}</span>
    <div class="absolute inset-y-0 right-4 flex items-center">
      <input
        class="border-grey-300 bg-transparent checked:bg-primary checked:hover:bg-primary focus:ring-primary focus:checked:bg-primary focus:checked:outline-none focus:checked:ring-0 focus:checked:ring-offset-0"
        :type="inputType"
        :name="block.id"
        :id="action.id"
        :value="action.label"
        @input="onInput"
        ref="buttonElement"
        :checked="isChecked"
      />
    </div>
  </label>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, inject } from "@vue/runtime-core";
import { onKeyStroke } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useConversation } from "@/stores/conversation";

const store = useConversation();

const props = defineProps<{
  index: number;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();
const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");

const buttonElement = ref<HTMLInputElement | null>(null);
const inputType = props.block.type === "checkbox" ? "checkbox" : "radio";
const shortcutKey = (props.index + 1).toString();

const isChecked = computed<boolean>(() => {
  if (Array.isArray(store.currentPayload)) {
    return (
      store.currentPayload.findIndex(
        (value) => value.actionId === props.action.id
      ) !== -1
    );
  } else {
    return props.action.id === store.currentPayload?.actionId;
  }
});

onMounted(() => {
  if (!disableFocus?.value && props.index === 0) {
    buttonElement.value?.focus();
  }
});

const onInput = () => {
  buttonElement.value?.focus();
  if (inputType === "checkbox") {
    store.toggleResponse(props.action, props.action.label);
  } else {
    store.setResponse(props.action, props.action.label);
  }
};

onKeyStroke(shortcutKey, onInput, { target: document });
</script>
