<template>
  <form class="mt-10 h-full" @submit.prevent="onSubmit">
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

    <button
      type="submit"
      class="mt-4 rounded bg-black px-2 py-1 font-medium text-white"
    >
      Next
    </button>
  </form>
</template>

<script lang="ts" setup>
import { useConversation } from "@/stores/conversation";
import ButtonAction from "./interactions/ButtonAction.vue";
import InputAction from "./interactions/InputAction.vue";
import { computed, Ref, ref } from "vue";

const props = defineProps<{
  block: PublicFormBlockModel;
}>();

const response: Ref<string | undefined> = ref(undefined);

const store = useConversation();

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

const onSubmit = () => {
  response.value = undefined;
  store.next();
};
</script>
