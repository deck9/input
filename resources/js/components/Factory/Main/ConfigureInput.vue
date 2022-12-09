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

const workbench = useWorkbench();

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

const isInitialized = ref(false);

onMounted(async () => {
  // find or create interaction
  if (workbench.block?.interactions) {
    let foundExisting = workbench.block.interactions.findIndex((item) => {
      return item.type === "input";
    });

    if (foundExisting === -1) {
      let response = await workbench.createInteraction("input");

      if (response) {
        interaction.value = response;
      }
    } else {
      interaction.value = workbench.block.interactions[foundExisting];
    }

    label.value = interaction.value.label;
    isInitialized.value = true;
  }
});

watch([label], (newValues) => {
  const update = {
    id: interaction.value.id,
    label: newValues[0],
  };

  workbench.updateInteraction(update);
});
</script>
