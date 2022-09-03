<template>
  <label :for="action.id" class="relative block cursor-pointer pb-3">
    <div class="inline-block pl-10">
      <span class="block font-medium">
        {{ action.label }}
        <sup v-if="action.options?.required" class="text-red-600"
          >*required</sup
        >
      </span>

      <p v-html="action.message"></p>
    </div>

    <div class="absolute left-0 top-[5px] flex">
      <input
        class="h-6 w-6 border-grey-300 bg-transparent checked:border-primary checked:bg-primary checked:hover:bg-primary focus:ring-primary focus:checked:bg-primary focus:checked:outline-none focus:checked:ring-0 focus:checked:ring-offset-0"
        type="checkbox"
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
const shortcutKey = (props.index + 1).toString();

const isChecked = computed<boolean>(() => {
  if (Array.isArray(store.currentPayload)) {
    return (
      store.currentPayload.findIndex(
        (value) => value.actionId === props.action.id
      ) !== -1
    );
  }

  return false;
});

onMounted(() => {
  if (!disableFocus?.value && props.index === 0) {
    buttonElement.value?.focus();
  }
});

const onInput = () => {
  buttonElement.value?.focus();
  store.toggleResponse(props.action, true);
};

onKeyStroke(shortcutKey, onInput, { target: document });
</script>
