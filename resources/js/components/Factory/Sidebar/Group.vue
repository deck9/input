<template>
  <div class="relative my-6 text-sm first-of-type:mt-0">
    <div class="rounded-md border-dashed px-6 py-4" :class="cardStyle">
      <BlockContainer :groupId="block.uuid" class="bg-green-300 py-4 px-4" />
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
