<template>
  <div
    class="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-white shadow"
    v-if="block.session_count !== 0"
  >
    <div class="px-4 py-5 sm:px-6">
      <span
        class="mb-1 inline-block rounded-full bg-blue-50 px-2 py-[2px] text-xs"
        v-if="block.title"
        >{{ block.title }}</span
      >
      <h4 class="text-lg font-medium" v-html="block.message"></h4>
    </div>
    <div class="px-4 py-5 sm:p-6">
      <div v-for="action in activeInteractions" :key="action.id">
        <Counter
          v-if="action.type === 'consent'"
          class="mb-2"
          :label="action.label ?? 'No label'"
          :count="action.responses_count"
        />

        <AverageValue
          v-if="action.type === 'range'"
          class="mb-2"
          :responses="action.form_session_responses"
        />

        <PercentageBar
          v-if="action.type === 'button'"
          class="mb-2"
          :label="action.label ?? 'No label'"
          :count="action.responses_count"
          :total="block.session_count"
        />
        <div v-if="action.type === 'input' || action.type === 'textarea'">
          <ResponseList v-bind="{ action }" />
        </div>
      </div>
    </div>
    <div class="mt-2 px-4 py-3 text-xs sm:px-6">
      {{ block.session_count }} votes
    </div>
  </div>
</template>

<script lang="ts" setup>
import AverageValue from "@/components/Factory/Submissions/AverageValue.vue";
import PercentageBar from "@/components/Factory/Submissions/PercentageBar.vue";
import Counter from "@/components/Factory/Submissions/Counter.vue";
import ResponseList from "@/components/Factory/Submissions/ResponseList.vue";
import useActiveInteractions from "@/components/Factory/Shared/useActiveInteractions";

const props = defineProps<{
  block: FormBlockModel;
}>();

const { activeInteractions } = useActiveInteractions(props.block);
</script>
