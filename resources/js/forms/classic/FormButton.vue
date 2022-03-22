<template>
  <button
    type="submit"
    ref="button"
    class="mt-4 rounded-md border border-transparent bg-black px-5 py-1 font-medium text-white shadow hover:bg-grey-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:px-10"
  >
    {{ isFinalConfirm ? "Submit" : "Next" }}
  </button>
</template>

<script lang="ts" setup>
import { templateRef } from "@vueuse/core";

defineProps<{
  isFinalConfirm?: boolean;
}>();

const button = templateRef<HTMLElement | null>("button", null);

const focus = () => {
  button.value?.focus();
};

defineExpose({ focus });
</script>
