<template>
  <VTooltip class="inline-flex cursor-pointer items-center">
    <span
      class="mr-1 inline-block h-3 w-3 rounded-full"
      :class="[isOK ? 'bg-green-400' : 'bg-red-400']"
    ></span>
    <span>{{ webhook.name }}</span>

    <template #popper>
      <span class="font-bold">HTTP {{ webhook.status }}</span>
      <pre
        class="mt-1 border-t border-dashed border-grey-700 pt-1 font-mono text-xs"
        v-html="prettyPrintedResponse"
      ></pre>
    </template>
  </VTooltip>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  webhook: FormSessionWebhookModel;
}>();

const isOK = computed(() => {
  if (!props.webhook.status) return false;

  return props.webhook.status >= 200 && props.webhook.status < 300;
});

const prettyPrintedResponse = computed(() => {
  if (typeof props.webhook.response === "string") {
    return props.webhook.response;
  }

  return JSON.stringify(props.webhook.response, null, 2);
});
</script>
