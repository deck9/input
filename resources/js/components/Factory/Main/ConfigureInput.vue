<template>
  <div class="mb-4">
    <D9Label label="Placeholder Text" />
    <D9Input
      placeholder="Your placeholder text"
      type="text"
      block
      v-model="label"
    />
  </div>

  <template v-if="block?.type === 'input-number'">
    <div class="mb-4">
      <D9Label
        label="Decimal Places"
        description="If empty, no decimal places are allowed"
      />
      <D9Input
        placeholder="Number of decimal places"
        type="number"
        min="0"
        max="10"
        step="1"
        block
        v-model="decimalPlaces"
      />
    </div>
    <div class="mb-4">
      <D9Label label="Icon" />
      <D9Input v-model="useSymbol" block />
    </div>
  </template>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input } from "@deck9/ui";
import { watch, Ref, ref } from "vue";
import { inject, onMounted } from "@vue/runtime-core";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const block: FormBlockModel | undefined = inject("block");

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const decimalPlaces = ref("0");
const useSymbol = ref("");
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  if (workbench.block?.interactions) {
    interaction.value = await findOrCreate("input", workbench);

    label.value = interaction.value.label;
    decimalPlaces.value =
      interaction.value.options?.decimalPlaces?.toString() ?? "";
    useSymbol.value = interaction.value.options?.useSymbol?.toString() ?? "";
  }
});

watch([label, decimalPlaces], (newValues: any[]) => {
  const update = {
    id: interaction.value.id,
    label: newValues[0],
    options: {
      decimalPlaces: newValues[1] ? parseInt(newValues[1]) : undefined,
    },
  };

  workbench.updateInteraction(update);
});
</script>
