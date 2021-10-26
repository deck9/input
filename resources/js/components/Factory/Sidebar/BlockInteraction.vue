<template>
  <div class="ml-5 pl-8 py-3 relative flex items-center">
    <div class="treeline absolute left-0 top-[22px] h-1 w-8 bg-grey-200"></div>
    <IndexItem :type="interaction.type" :index="index" />
    <div class="ml-2 text-sm font-medium">{{ interaction.label ?? "-" }}</div>
  </div>
</template>

<script setup lang="ts">
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";

defineProps<{
  index?: number;
  interaction: FormBlockInteractionModel;
}>();
</script>
