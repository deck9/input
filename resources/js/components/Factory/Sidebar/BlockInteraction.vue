<template>
  <div class="ml-5 pl-8 py-3 relative flex items-center">
    <div class="absolute left-0 top-[22px] h-1 w-8 bg-grey-200"></div>
    <div
      class="relative z-10 w-8 h-6 flex items-center justify-center bg-blue-600 rounded text-white"
    >
      <D9Icon :name="iconName" />
    </div>
    <div class="ml-1 text-sm">{{ interaction.label ?? '-' }}</div>
  </div>
</template>


<script setup lang="ts">
import { D9Icon } from "@deck9/ui"
import { computed } from "@vue/reactivity";

const props = defineProps<{
  interaction: FormBlockInteractionModel
}>()


const iconName = computed((): string => {
  switch (props.interaction.type) {
    case 'input':
      return 'envelope';
    default:
      return 'play-circle'
  }
})
</script>
