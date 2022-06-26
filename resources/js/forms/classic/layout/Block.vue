<template>
  <form @submit.prevent="onSubmit">
    <div class="prose" v-html="block.message"></div>

    <div class="mt-6">
      <div
        class="mb-2"
        v-for="(action, index) in block.interactions"
        :key="action.id"
      >
        <component
          :is="actionComponent"
          :block="block"
          :index="index"
          :action="action"
        ></component>
      </div>
    </div>

    <FormButton
      :isDisabled="!isValid"
      :isProcessing="store.isProcessing"
      ref="submitButton"
      :label="store.isLastBlock ? 'Submit' : 'Next'"
      v-bind="{ ...actionProps }"
    />
  </form>
</template>

<script lang="ts" setup>
import FormButton from "./FormButton.vue";
import { useConversation } from "@/stores/conversation";
import { useActions } from "@/forms/classic/useActions";
import { computed, ComputedRef, inject, onMounted } from "vue";
import { templateRef, onKeyStroke } from "@vueuse/core";

const props = defineProps<{
  block: PublicFormBlockModel;
}>();

const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");
const store = useConversation();

const { actionComponent, actionValidator, actionProps } = useActions(
  props.block
);

const submitButton = templateRef<HTMLElement | null>("submitButton", null);
const isValid = computed(() => {
  return actionValidator ? actionValidator(store.currentPayload) : true;
});

onMounted(() => {
  // we should focus submit button, if no action component is present
  if (!actionComponent && !disableFocus?.value) {
    submitButton.value?.focus();
  }
});

const onSubmit = async () => {
  if (!isValid.value) {
    return;
  }

  await store.next();
};

onKeyStroke("Enter", (e) => {
  if (store.isEnterDisabled) {
    return;
  }

  e.preventDefault();
  onSubmit();
});

defineExpose({ isValid, onSubmit });
</script>
