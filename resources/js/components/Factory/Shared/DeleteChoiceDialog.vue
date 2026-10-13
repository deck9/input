<template>
  <DeleteDialog
    :show="choice !== null"
    :title="title"
    :text="text"
    :confirm-label="policy ? 'Delete consent' : 'Delete choice'"
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
  // a consent policy: people agree to it
  policy?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const title = computed(() => {
  const label = props.choice?.label;

  if (props.policy) {
    return label ? `Delete consent “${label}”?` : "Delete this consent?";
  }

  return label ? `Delete “${label}”?` : "Delete this choice?";
});

const text = computed(() => {
  const picked = props.policy ? "agreed to" : "picked";

  if (props.answers === undefined) {
    return `If people ${picked} it, their answers to it will be deleted.`;
  }

  const people = props.answers === 1 ? "1 person" : `${props.answers} people`;

  return `${people} ${picked} it. Their answers to it will be deleted.`;
});
</script>
