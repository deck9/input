<template>
  <DeleteDialog
    :show="choice !== null"
    :title="choice?.label ? `Delete “${choice.label}”?` : 'Delete this choice?'"
    :text="text"
    confirm-label="Delete choice"
    @close="emit('close')"
    @confirm="emit('confirm')"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import DeleteDialog from "./DeleteDialog.vue";

const props = defineProps<{
  // open while set
  choice: Pick<FormBlockInteractionModel, "id" | "label"> | null;
  // missing when the server couldn't say
  answers?: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const text = computed(() => {
  if (props.answers === undefined) {
    return "The answers that picked it will be deleted.";
  }

  const people = props.answers === 1 ? "1 person" : `${props.answers} people`;

  return `${people} picked it. Their answers to it will be deleted.`;
});
</script>
