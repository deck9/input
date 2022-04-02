<template>
  <div class="overflow-hidden rounded-lg bg-white shadow">
    <div class="px-4 py-5 sm:px-6">
      <span class="font-mono text-xs text-grey-600">{{
        block.title ?? block.uuid
      }}</span>
      <h4 class="text-lg font-medium" v-html="block.message"></h4>
    </div>
    <div class="px-4 py-5 sm:p-6">
      <pre class="text-xs">{{ activeInteractions }}</pre>
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
