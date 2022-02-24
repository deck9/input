<template>
  <div class="text-grey-400 flex justify-between font-mono text-xs">
    <div>
      <span class="mr-1 text-xs">ID</span>
      <span
        class="text-grey-400 inline-block rounded px-2 italic leading-normal"
      >
        {{ block.uuid }}
      </span>
    </div>
    <div>
      <span class="mr-1 text-xs">Last Change</span>
      <span
        class="text-grey-400 inline-block rounded px-2 italic leading-normal"
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
  return new Date(props.block?.updated_at).toLocaleString();
});
</script>
