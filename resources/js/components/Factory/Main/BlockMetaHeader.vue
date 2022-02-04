<template>
  <div class="mb-4 flex justify-between font-mono text-xs text-grey-500">
    <div>
      <span class="mr-1 text-xs">ID</span>
      <span class="inline-block rounded bg-grey-300 px-2 leading-normal">
        {{ block.uuid }}
      </span>
    </div>
    <div>
      <span class="mr-1 text-xs">Last Change</span>
      <span class="inline-block rounded bg-grey-300 px-2 leading-normal">{{
        formattedUpdatedAt
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  block: FormBlockModel;
}>();

const formattedUpdatedAt = computed(() => {
  return new Date(props.block?.updated_at).toLocaleString();
});
</script>
