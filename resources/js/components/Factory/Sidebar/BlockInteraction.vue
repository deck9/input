<template>
  <div class="relative ml-[3px] flex items-center py-1">
    <IndexItem class="shrink-0" :type="interaction.type" :index="index" />
    <div class="ml-2 text-sm" v-if="interaction.type === 'range'">
      <span
        >rate from <strong>{{ interaction.options.start }}</strong> to
        <strong>{{ interaction.options.end }}</strong></span
      >
    </div>
    <div v-else class="ml-3 text-sm">{{ interaction.label ?? "-" }}</div>
  </div>
</template>

<script setup lang="ts">
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";

defineProps<{
  index?: number;
  interaction: FormBlockInteractionModel;
}>();
</script>
