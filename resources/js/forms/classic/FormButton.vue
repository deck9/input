<template>
  <div class="mt-8 flex items-center">
    <button
      type="submit"
      ref="button"
      :class="{ 'pointer-events-none opacity-50': isProcessing || isDisabled }"
      class="text-contrast relative rounded-md border border-transparent bg-primary px-5 py-1 font-medium shadow transition duration-200 hover:bg-primary/75 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:px-10"
      :tabindex="isDisabled ? -1 : 0"
    >
      <span :class="{ invisible: isProcessing }">{{ label }}</span>
      <span
        v-show="isProcessing"
        class="absolute inset-0 flex items-center justify-center"
      >
        <D9Icon class="animate-spin" icon="circle-notch" />
      </span>
    </button>

    <span
      :class="{ 'pointer-events-none opacity-0': isDisabled }"
      class="ml-4 inline-block text-xs font-bold leading-none text-grey-700 transition duration-150"
    >
      Enter
      <D9Icon class="ml-px rotate-90" icon="turn-down" />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { templateRef } from "@vueuse/core";
import { D9Icon } from "@deck9/ui";

defineProps<{
  isDisabled?: boolean;
  isProcessing?: boolean;
  label: string;
}>();

const button = templateRef<HTMLElement | null>("button", null);

const focus = () => {
  button.value?.focus();
};

defineExpose({ focus });
</script>
