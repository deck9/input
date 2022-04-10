<template>
  <div
    class="overflow-hidden rounded-lg bg-white shadow"
    v-if="block.session_count !== 0"
  >
    <div class="px-4 py-5 sm:px-6">
      <h4 class="text-lg font-medium" v-html="block.message"></h4>
    </div>
    <div class="px-4 py-5 sm:p-6">
      <PercentageBar
        class="mb-2"
        v-for="action in activeInteractions"
        :key="action.id"
        :label="action.label ?? 'No label'"
        :count="action.responses_count"
        :total="block.session_count"
      />
      <div class="py-2 text-xs">{{ block.session_count }} votes</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PercentageBar from "@/components/Factory/Results/PercentageBar.vue";
import useActiveInteractions from "@/components/Factory/Shared/useActiveInteractions";

const props = defineProps<{
  block: FormBlockModel;
}>();

const { activeInteractions } = useActiveInteractions(props.block);
</script>
