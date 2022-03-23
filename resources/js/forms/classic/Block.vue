<template>
  <form @submit.prevent="onSubmit">
    <div class="prose" v-html="block.message"></div>

    <div class="mt-6">
      <div
        class="mb-2"
        v-for="(action, index) in block.interactions"
        :key="action.id"
      >
        <ButtonAction
          v-if="useButtonComponent"
          :block="block"
          :index="index"
          :action="action"
          v-model="response"
        />
        <InputAction
          v-if="useInputComponent"
          :block="block"
          :action="action"
          v-model="response"
        />
      </div>
    </div>

    <FormButton ref="submitButton" :isFinalConfirm="store.isLastBlock" />
  </form>
</template>

<script lang="ts" setup>
import { useConversation } from "@/stores/conversation";
import ButtonAction from "./interactions/ButtonAction.vue";
import InputAction from "./interactions/InputAction.vue";
import FormButton from "./FormButton.vue";
import { computed, onMounted, Ref, ref } from "vue";
import { templateRef } from "@vueuse/core";

const props = defineProps<{
  block: PublicFormBlockModel;
}>();

const store = useConversation();
const response: Ref<string | undefined> = ref(undefined);
// if we render the block, and user has already set a response, we should reload the response
if (store.currentResponse !== null) {
  response.value = store.currentResponse;
}

const submitButton = templateRef<HTMLElement | null>("submitButton", null);

onMounted(() => {
  // we should focus interactions if we can
  if (props.block.type === "none") {
    submitButton.value?.focus();
  }
});

const useButtonComponent = computed(() => {
  return ["radio", "checkbox"].includes(props.block.type);
});

const useInputComponent = computed(() => {
  return [
    "input-short",
    "input-email",
    "input-number",
    "input-link",
    "input-phone",
  ].includes(props.block.type);
});

const onSubmit = async () => {
  store.setResponse(response.value);

  const isSubmitted = await store.next();

  if (!isSubmitted) {
    response.value = undefined;
  }
};
</script>
