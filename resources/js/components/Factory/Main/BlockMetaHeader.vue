<template>
  <div class="flex justify-between font-mono text-xs text-grey-400">
    <div>
      <span class="mr-1 text-xs">ID</span>
      <span
        class="inline-block rounded px-2 italic leading-normal text-grey-400"
      >
        {{ block.uuid }}
      </span>
    </div>
    <div>
      <span class="mr-1 text-xs">Last Change</span>
      <span
        class="inline-block rounded px-2 italic leading-normal text-grey-400"
        >{{ formattedUpdatedAt }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  block: FormBlockModel;
}>();

const formattedUpdatedAt = computed(() => {
  return new Date(props.block?.updated_at).toLocaleString(navigator.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
});
</script>
