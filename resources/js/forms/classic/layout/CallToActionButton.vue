<template>
  <div class="mt-8 flex items-center">
    <a
      :href="href"
      ref="button"
      :class="{ 'pointer-events-none opacity-50': isProcessing || isDisabled }"
      target="_top"
      class="relative rounded-md border border-transparent !bg-primary px-5 py-1 font-medium !text-contrast no-underline shadow transition duration-200 hover:bg-primary/75 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:px-10"
    >
      <span :class="{ invisible: isProcessing }">{{ label }}</span>
      <span
        v-show="isProcessing"
        class="absolute inset-0 flex items-center justify-center"
      >
        <D9Icon class="animate-spin" icon="circle-notch" />
      </span>
    </a>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { ref } from "vue";

defineProps<{
  isDisabled?: boolean;
  isProcessing?: boolean;
  label: string;
  href?: string;
}>();

const button = ref<HTMLElement | null>(null);

const focus = () => {
  button.value?.focus();
};

defineExpose({ focus });
</script>
