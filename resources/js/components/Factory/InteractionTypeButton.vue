<template>
  <button
    class="
      bg-white
      border-2
      cursor-pointer
      flex-col
      inline-flex
      items-center
      justify-center
      mr-1
      px-2
      py-4
      relative
      rounded
      transition-sm
      w-32
    "
    :class="
      isActive
        ? 'border-blue-400 text-blue-500'
        : 'border-transparent text-grey-500 hover:border-blue-300'
    "
    :aria-label="label"
    @click="emitInput"
  >
    <InteractionTypeIcon class="text-xl fill-current" :type="value" />

    <span class="mt-2 text-xs truncate">{{ label }}</span>

    <div v-if="isActive" class="absolute top-0 right-0 px-2 py-1 leading-none">
      <D9Icon name="play-circle" class="icon text-blue-400" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { D9Icon } from "@deck9/ui";
import InteractionTypeIcon from "./Shared/InteractionTypeIcon.vue";

const props = defineProps<{
  value: string;
  label: string;
  current?: FormBlockModel["type"];
}>();

const emits = defineEmits<{
  (e: "onInput", value: string): void;
}>();

const isActive = computed(() => {
  return props.value === props.current;
});

const emitInput = () => {
  emits("onInput", props.value);
};
</script>
