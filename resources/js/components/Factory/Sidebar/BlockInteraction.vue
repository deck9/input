<template>
  <div class="relative flex items-center py-2 ml-[3px]">
    <IndexItem :type="interaction.type" :index="index" />
    <div class="ml-3 text-sm font-medium">{{ interaction.label ?? "-" }}</div>
  </div>
</template>

<script setup lang="ts">
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";

defineProps<{
  index?: number;
  interaction: FormBlockInteractionModel;
}>();
</script>
