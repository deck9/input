<template>
  <div>
    <div class="mb-4">
      <D9Label id="date-min" label="Min date" />
      <D9Input id="date-min" type="date" block v-model="minDate" />
    </div>
    <div class="mb-4">
      <D9Label id="date-max" label="Max date" />
      <D9Input id="date-max" type="date" block v-model="maxDate" />
    </div>
    <div class="mb-4 flex items-center justify-between">
      <D9Label id="no-past-dates" label="No dates in the past" />
      <D9Switch id="no-past-dates" label="" v-model="noPastDates" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input, D9Switch } from "@deck9/ui";
import { Ref, ref } from "vue";
import { onMounted } from "vue";
import { useInteractionsUtils } from "@/components/Factory/utils/useInteractionsUtils";
import { useSettingsWatch } from "@/components/Factory/utils/useSettingsWatch";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const minDate = ref<string | null>("");
const maxDate = ref<string | null>("");
const noPastDates = ref(false);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  if (workbench.block?.interactions) {
    const isNew = !workbench.block.interactions.some(
      (item) => item.type === "date",
    );
    interaction.value = await findOrCreate("date", workbench);

    minDate.value = interaction.value.options?.minDate ?? null;
    maxDate.value = interaction.value.options?.maxDate ?? null;
    noPastDates.value = interaction.value.options?.noPastDates ?? false;
    await settled(isNew);
  }
});

const settled = useSettingsWatch([minDate, maxDate, noPastDates], (newValues) => {
  const update = {
    id: interaction.value.id,
    options: {
      minDate: newValues[0],
      maxDate: newValues[1],
      noPastDates: newValues[2],
    },
  };

  workbench.updateInteraction(update);
});
</script>
