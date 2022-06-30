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
import { watch, Ref, ref } from "vue";
import { onMounted } from "@vue/runtime-core";

const workbench = useWorkbench();

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const rows = <Ref<number>>ref(5);
const maxChars = <Ref<number>>ref(500);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  // find or create interaction
  if (workbench.block?.interactions) {
    let foundExisting = workbench.block.interactions.findIndex((item) => {
      return item.type === "textarea";
    });

    if (foundExisting === -1) {
      let response = await workbench.createInteraction("textarea");

      if (response) {
        interaction.value = response;
      }
    } else {
      interaction.value = workbench.block.interactions[foundExisting];
    }

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
