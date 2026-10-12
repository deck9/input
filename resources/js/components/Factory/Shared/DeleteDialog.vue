<template>
  <ConfirmationModal :show="show" max-width="md" danger @close="emit('close')">
    <template #title>
      <span class="font-semibold [overflow-wrap:anywhere]">{{ title }}</span>
    </template>
    <template #content>
      <p class="text-sm text-grey-600 [overflow-wrap:anywhere]">{{ text }}</p>
      <p v-if="note" class="mt-2 text-sm text-grey-600">{{ note }}</p>
    </template>
    <template #footer>
      <D9Button
        label="Cancel"
        color="light"
        class="!bg-white shadow-[inset_0_0_0_1px_theme(colors.grey.300)] hover:!bg-blue-100"
        @click="emit('close')"
      />
      <!-- shaped like the D9 Cancel next to it -->
      <DangerButton
        class="ml-2 !rounded-lg !border-0 !px-5 !text-sm !font-medium !normal-case !leading-4 !tracking-normal"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </DangerButton>
    </template>
  </ConfirmationModal>
</template>

<script setup lang="ts">
import { D9Button } from "@deck9/ui";
import { useEventListener } from "@vueuse/core";
import ConfirmationModal from "@/Jetstream/ConfirmationModal.vue";
import DangerButton from "@/Jetstream/DangerButton.vue";

const props = defineProps<{
  show: boolean;
  title: string;
  text: string;
  note?: string;
  confirmLabel: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();

// Escape closes only this dialog, not the logic panel under it
useEventListener(
  window,
  "keydown",
  (event: KeyboardEvent) => {
    if (props.show && event.key === "Escape") {
      event.stopPropagation();
      emit("close");
    }
  },
  { capture: true },
);
</script>
