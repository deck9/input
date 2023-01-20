<template>
  <div class="relative pb-6 text-sm">
    <div class="rounded-md border-dashed px-4 py-3" :class="cardStyle">
      <h1 class="mb-3 font-bold text-grey-400">Group {{ block.uuid }}</h1>
      <BlockContainer :groupId="block.uuid" class="transition duration-200" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BlockContainer from "@/components/Factory/Sidebar/BlockContainer.vue";
import { useActiveCard } from "@/utils/useActiveCard";
import { ref } from "vue";

defineProps<{
  block: FormBlockModel;
}>();

const isActive = ref(false);
const { cardStyle } = useActiveCard(isActive);
</script>
