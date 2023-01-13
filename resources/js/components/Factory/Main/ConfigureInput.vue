<template>
  <div v-if="isInitialized" class="mb-4">
    <D9Label label="Placeholder Text" />
    <D9Input
      placeholder="Your placeholder text"
      type="text"
      block
      v-model="label"
    />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input } from "@deck9/ui";
import { watch, Ref, ref } from "vue";
import { onMounted } from "@vue/runtime-core";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

const isInitialized = ref(false);

onMounted(async () => {
  interaction.value = await findOrCreate("input", workbench);

  label.value = interaction.value.label;
  isInitialized.value = true;
});

watch([label], (newValues) => {
  const update = {
    id: interaction.value.id,
    label: newValues[0],
  };

  workbench.updateInteraction(update);
});
</script>
