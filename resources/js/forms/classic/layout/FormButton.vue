<template>
  <div class="mt-8 flex items-center justify-between">
    <div class="flex items-center">
      <button
        type="submit"
        ref="button"
        :class="{
          'pointer-events-none opacity-50': isProcessing || isDisabled,
        }"
        class="relative rounded-md border border-transparent bg-primary px-5 py-1 font-medium text-contrast shadow transition duration-200 hover:bg-primary/75 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:px-10"
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
        v-if="!enableInputMode"
        :class="{ 'pointer-events-none opacity-0': isDisabled }"
        class="ml-4 inline-flex items-center justify-center text-xs font-bold leading-none text-content/80 transition duration-150"
      >
        {{ t("Enter") }}
        <D9Icon class="ml-1 rotate-90" icon="turn-down" />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

defineProps<{
  isDisabled?: boolean;
  isProcessing?: boolean;
  label: string;
  enableInputMode?: boolean;
}>();

const { t } = useI18n();

const button = ref<HTMLElement | null>(null);

const focus = () => {
  button.value?.focus();
};

defineExpose({ focus });
</script>
