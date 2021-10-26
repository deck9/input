<template>
  <div class="mb-4 text-grey-500 text-xs font-mono flex justify-between">
    <div>
      <span class="text-xs mr-1">ID</span>
      <span class="bg-grey-300 inline-block leading-normal px-2 rounded">
        {{ block.uuid }}
      </span>
    </div>
    <div>
      <span class="text-xs mr-1">Last Change</span>
      <span class="bg-grey-300 inline-block leading-normal px-2 rounded">{{
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
