<template>
  <div
    class="overflow-hidden rounded-lg bg-white shadow"
    v-if="block.session_count !== 0"
  >
    <div class="px-4 py-5 sm:px-6">
      <span class="font-mono text-xs text-grey-600">{{
        block.title ?? block.uuid
      }}</span>
      <h4 class="text-lg font-medium" v-html="block.message"></h4>
    </div>
    <div class="px-4 py-5 sm:p-6">
      <div class="mb-4 border-b border-grey-200 py-2 font-medium">
        {{ block.session_count }} responses
      </div>

      <div
        class="grid grid-cols-2 gap-x-6"
        v-for="action in activeInteractions"
        :key="action.id"
      >
        <div class="text-right">{{ action.label }}</div>
        <div class="font-bold">{{ action.responses_count }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useActiveInteractions from "@/components/Factory/Shared/useActiveInteractions";

const props = defineProps<{
  block: FormBlockModel;
}>();

const { activeInteractions } = useActiveInteractions(props.block);
</script>
