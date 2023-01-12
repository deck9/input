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
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input } from "@deck9/ui";
import { watch, Ref, ref } from "vue";
import { onMounted } from "@vue/runtime-core";
import { useInteractionsUtils } from "@/components/Factory/utils/useInteractionsUtils";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  if (workbench.block?.interactions) {
    interaction.value = await findOrCreate("date", workbench);

    label.value = interaction.value.label;
  }
});

watch([label], (newValues: any[]) => {
  const update = {
    id: interaction.value.id,
    label: newValues[0],
  };

  workbench.updateInteraction(update);
});
</script>
