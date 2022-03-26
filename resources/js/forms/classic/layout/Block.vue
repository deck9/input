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
          v-model="response"
        ></component>
      </div>
    </div>

    <FormButton
      :isDisabled="!isValid"
      :isProcessing="store.isProcessing"
      ref="submitButton"
      :label="store.isLastBlock ? 'Submit' : 'Next'"
    />
  </form>
</template>

<script lang="ts" setup>
import FormButton from "./FormButton.vue";
import { useConversation } from "@/stores/conversation";
import { useActions } from "@/forms/classic/useActions";
import { onMounted } from "vue";
import { templateRef, onKeyStroke } from "@vueuse/core";

const props = defineProps<{
  block: PublicFormBlockModel;
}>();

const store = useConversation();
const { response, actionComponent, isValid } = useActions(props.block);

// if we render the block, and user has already set a response, we should reload the response
if (store.currentResponse !== null) {
  response.value = store.currentResponse;
}

const submitButton = templateRef<HTMLElement | null>("submitButton", null);

onMounted(() => {
  // we should focus submit button on text only blocks
  if (props.block.type === "none") {
    submitButton.value?.focus();
  }
});

const onSubmit = async () => {
  store.setResponse(response.value);

  const isSubmitted = await store.next();

  if (!isSubmitted) {
    response.value = undefined;
  }
};

onKeyStroke("Enter", (e) => {
  if (!isValid.value) {
    return;
  }

  e.preventDefault();

  onSubmit();
});
</script>
