<template>
  <ul class="list-inside space-y-1 text-xs font-medium leading-6">
    <li
      class="inline-flex w-full justify-between whitespace-nowrap rounded bg-grey-50 px-3 py-1 transition-colors duration-150 hover:bg-grey-100"
      v-for="response in lastResponses"
      :key="response.id"
    >
      <span>{{ response.value }}</span>
      <span class="text-grey-400">{{
        new Date(response.updated_at).toLocaleString()
      }}</span>
    </li>
    <li class="rounded bg-grey-50 px-3 py-1" v-if="hasMoreResponses">...</li>
  </ul>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  action: FormBlockInteractionModel;
}>();

const lastResponses = computed(() => {
  return props.action.form_session_responses.slice(-4).reverse();
});

const hasMoreResponses = computed(() => {
  return props.action.form_session_responses.length > 4;
});
</script>
