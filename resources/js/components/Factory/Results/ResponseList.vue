<template>
  <ul class="list-inside list-disc">
    <li
      class="font-medium leading-6"
      v-for="response in lastResponses"
      :key="response.id"
    >
      {{ response.value }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { computed } from "@vue/reactivity";

const props = defineProps<{
  action: FormBlockInteractionModel;
}>();

const lastResponses = computed(() => {
  return props.action.form_session_responses.slice(-10);
});
</script>
