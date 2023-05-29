<template>
  <div>
    <div class="mb-4">
      <D9Label label="Min Date" />
      <D9Input type="date" block v-model="minDate" />
    </div>
    <div class="mb-4">
      <D9Label label="Max Date" />
      <D9Input type="date" block v-model="maxDate" />
    </div>
    <div class="mb-4 flex items-center justify-between">
      <D9Label label="Do not allow past dates" />
      <D9Switch label="" v-model="noPastDates" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input, D9Switch } from "@deck9/ui";
import { watch, Ref, ref } from "vue";
import { onMounted } from "vue";
import { useInteractionsUtils } from "@/components/Factory/utils/useInteractionsUtils";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const minDate = ref<string | null>("");
const maxDate = ref<string | null>("");
const noPastDates = ref<boolean | null>(false);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  if (workbench.block?.interactions) {
    interaction.value = await findOrCreate("date", workbench);

    minDate.value = interaction.value.options?.minDate ?? null;
    maxDate.value = interaction.value.options?.maxDate ?? null;
    noPastDates.value = interaction.value.options?.noPastDates ?? null;
  }
});

watch([minDate, maxDate, noPastDates], (newValues: any[]) => {
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
