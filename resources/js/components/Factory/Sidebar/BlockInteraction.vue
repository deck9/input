<template>
  <div class="relative ml-[3px] flex items-center py-1">
    <IndexItem :type="interaction.type" :index="index" />
    <div class="ml-3 text-sm">{{ interaction.label ?? "-" }}</div>
  </div>
</template>

<script setup lang="ts">
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";

defineProps<{
  index?: number;
  interaction: FormBlockInteractionModel;
}>();
</script>
