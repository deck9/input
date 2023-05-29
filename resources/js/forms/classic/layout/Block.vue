<template>
  <form @submit.prevent="onSubmit" :title="`Form for section ${block.id}`">
    <div class="text-content" v-html="block.message"></div>

    <div class="mt-6">
      <div
        class="mb-2"
        v-for="(action, index) in block.interactions"
        :key="action.id"
      >
        <component
          :is="actionComponent"
          v-bind="{
            block,
            index,
            action,
          }"
        ></component>
      </div>
    </div>

    <div v-if="showValidationMessage" class="text-sm text-red-500">
      {{ t(validator.message ?? "Something went wrong validating your input") }}
    </div>

    <FormButton
      :isDisabled="!validator.valid"
      :isProcessing="store.isProcessing"
      ref="submitButton"
      :label="submitButtonLabel"
      v-bind="{ ...actionProps }"
    />
  </form>
</template>

<script lang="ts" setup>
import FormButton from "./FormButton.vue";
import { useConversation } from "@/stores/conversation";
import { useActions } from "@/forms/classic/useActions";
import { computed, ComputedRef, inject, onMounted, ref } from "vue";
import { templateRef, onKeyStroke } from "@vueuse/core";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  block: PublicFormBlockModel;
}>();

const { t } = useI18n();

const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");
const store = useConversation();

const { actionComponent, actionValidator, actionProps } = useActions(
  props.block
);

const submitButton = templateRef<HTMLElement | null>("submitButton", null);
const validator = computed(() => {
  return actionValidator
    ? actionValidator(store.currentPayload)
    : { valid: true };
});

const focusSubmitButton = () => {
  submitButton.value?.focus();
};

onMounted(() => {
  // we should focus submit button, if no action component is present
  if (!actionComponent && !disableFocus?.value) {
    focusSubmitButton();
  }
});

const showValidationMessage = ref(false);

const submitButtonLabel = computed(() => {
  if (store.currentBlock?.type === "consent") {
    if (!store.hasRequiredFields && store.countCurrentSelections === 0) {
      return store.isLastBlock ? t("Submit") : t("Continue");
    } else {
      return store.isLastBlock ? t("Accept & Submit") : t("Accept");
    }
  } else {
    return store.isLastBlock ? t("Submit") : t("Next");
  }
});

const onSubmit = async () => {
  if (!validator.value.valid) {
    showValidationMessage.value = true;
    return;
  }

  showValidationMessage.value = false;

  await store.next();
};

onKeyStroke("Enter", (e) => {
  if (store.isInputMode) {
    return;
  }

  e.preventDefault();

  onSubmit();
});

defineExpose({ validator, onSubmit });
</script>
