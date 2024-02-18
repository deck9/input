<template>
  <div>
    <div class="mb-4">
      <D9Label label="Placeholder Text" />
      <D9Input
        placeholder="Your placeholder text"
        type="text"
        block
        v-model="label"
      />
    </div>
    <div class="mb-4">
      <D9Label
        label="Rows"
        description="The max allowed number of rows is 10"
      />
      <D9Input
        placeholder="The size of the textarea"
        type="number"
        min="1"
        max="10"
        step="1"
        block
        v-model="rows"
      />
    </div>
    <div class="mb-4">
      <D9Label label="Max Characters" />
      <D9Input
        placeholder="The maximum number of characters"
        type="number"
        block
        v-model="maxChars"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input } from "@deck9/ui";
import { watch, Ref, ref, onMounted } from "vue";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const label = ref<FormBlockInteractionModel["label"]>("");
const rows = ref<number>(5);
const maxChars = ref<number>(500);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  // find or create interaction
  if (workbench.block?.interactions) {
    interaction.value = await findOrCreate("textarea", workbench);

    label.value = interaction.value.label;
    rows.value = interaction.value.options?.rows ?? 5;
    maxChars.value = interaction.value.options?.max_chars ?? 500;
  }
});

watch([label, rows, maxChars], (newValues: any[]) => {
  const update = {
    id: interaction.value.id,
    label: newValues[0],
    options: {
      rows: Math.max(1, Math.min(10, parseInt(newValues[1]))),
      max_chars: parseInt(newValues[2]),
    },
  };

  workbench.updateInteraction(update);
});
</script>
