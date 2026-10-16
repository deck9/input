<template>
  <div class="mb-4">
    <D9Label id="input-placeholder" label="Placeholder" />
    <D9Input
      id="input-placeholder"
      placeholder="Your placeholder text"
      type="text"
      block
      v-model="label"
    />
  </div>

  <template v-if="block?.type === 'input-number'">
    <div class="mb-4">
      <D9Label
        id="input-decimal-places"
        label="Decimal places"
        description="Leave empty for whole numbers only."
      />
      <D9Input
        id="input-decimal-places"
        type="number"
        :min="0"
        :max="10"
        step="1"
        block
        v-model="decimalPlaces"
      />
    </div>
    <div class="mb-4">
      <D9Label
        id="input-symbol"
        label="Symbol"
        description="Shown next to the number, e.g. € or kg."
      />
      <D9Input id="input-symbol" v-model="useSymbol" block maxlength="3" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input } from "@deck9/ui";
import { Ref, ref, inject, onMounted } from "vue";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";
import { clampInteger } from "@/utils";
import { useSettingsWatch } from "../utils/useSettingsWatch";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const block: FormBlockModel | undefined = inject("block");

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const decimalPlaces = ref("0");
const useSymbol = ref("");
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  if (workbench.block?.interactions) {
    const isNew = !workbench.block.interactions.some(
      (item) => item.type === "input",
    );
    interaction.value = await findOrCreate("input", workbench);

    label.value = interaction.value.label;
    decimalPlaces.value =
      interaction.value.options?.decimalPlaces?.toString() ?? "";
    useSymbol.value = interaction.value.options?.useSymbol?.toString() ?? "";
    await settled(isNew);
  }
});

const settled = useSettingsWatch([label, decimalPlaces, useSymbol], (newValues) => {
  const update = {
    id: interaction.value.id,
    label: newValues[0],
    options: {
      decimalPlaces: clampInteger(newValues[1], 0, 10),
      useSymbol: newValues[2] ? newValues[2] : undefined,
    },
  };

  workbench.updateInteraction(update);
});
</script>
