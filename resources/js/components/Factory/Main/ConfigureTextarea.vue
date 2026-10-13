<template>
  <div>
    <div class="mb-4">
      <D9Label id="textarea-placeholder" label="Placeholder" />
      <D9Input
        id="textarea-placeholder"
        placeholder="Your placeholder text"
        type="text"
        block
        v-model="label"
      />
    </div>
    <div class="mb-4">
      <D9Label
        id="textarea-rows"
        label="Height in lines"
        description="1 to 10"
      />
      <D9Input
        id="textarea-rows"
        placeholder="e.g. 4"
        type="number"
        :min="1"
        :max="10"
        step="1"
        block
        v-model="rows"
      />
    </div>
    <div class="mb-4">
      <D9Label id="textarea-max-chars" label="Max characters" />
      <D9Input
        id="textarea-max-chars"
        placeholder="e.g. 500"
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
