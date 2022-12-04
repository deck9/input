<template>
  <div class="mb-4">
    <D9Label label="Min Rating" />
    <D9Input
      placeholder="Min Rating"
      type="number"
      block
      v-model="startValue"
    />
  </div>
  <div class="mb-4">
    <D9Label label="Max Rating" />
    <D9Input placeholder="Max Rating" type="number" block v-model="endValue" />
  </div>
  <div class="mb-4" v-if="icon">
    <D9Label label="Icon" />
    <D9Select :options="iconOptions" v-model="icon" :icon="icon.icon" />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input, D9Select } from "@deck9/ui";
import { watch, Ref, ref } from "vue";
import { onMounted } from "@vue/runtime-core";

const workbench = useWorkbench();

const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

const startValue = ref(1);
const endValue = ref(5);

const iconOptions = ref([
  { label: "Star", value: "star", icon: "star" },
  { label: "Globe", value: "globe", icon: "globe" },
  { label: "Hashtag", value: "hashtag", icon: "hashtag" },
  { label: "Shield", value: "shield", icon: "shield" },
  { label: "Trophy", value: "trophy", icon: "trophy" },
]);
const icon = ref<{
  label: string;
  value: string;
  icon: string;
}>();

onMounted(async () => {
  // find or create interaction
  if (workbench.block?.interactions) {
    let foundExisting = workbench.block.interactions.findIndex((item) => {
      return item.type === "range";
    });

    if (foundExisting === -1) {
      let response = await workbench.createInteraction("range");

      if (response) {
        interaction.value = response;
      }
    } else {
      interaction.value = workbench.block.interactions[foundExisting];
    }

    // init settings
    startValue.value = interaction.value.options?.start ?? 1;
    endValue.value = interaction.value.options?.end ?? 5;

    icon.value =
      iconOptions.value.find((i) => {
        return i.value === interaction.value.options?.icon;
      }) ?? iconOptions.value[0];
  }
});

watch([startValue, endValue, icon], (newValues) => {
  const update: { id: number } & Partial<FormBlockInteractionModel> = {
    id: interaction.value.id,
    options: {
      start: Number(newValues[0]),
      end: Number(newValues[1]),
    },
  };

  if (newValues[2]) {
    update.options = {
      ...update.options,
      icon: newValues[2].value,
    };
  }

  workbench.updateInteraction(update);
});
</script>
