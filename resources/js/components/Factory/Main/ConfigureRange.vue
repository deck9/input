<template>
  <div v-if="isInitialized">
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
      <D9Input
        placeholder="Max Rating"
        type="number"
        block
        v-model="endValue"
      />
    </div>

    <div class="mb-4">
      <D9Label label="Left Label" />
      <D9Input placeholder="Left Label" type="text" block v-model="labelLeft" />
    </div>
    <div class="mb-4">
      <D9Label label="Right Label" />
      <D9Input
        placeholder="Right Label"
        type="text"
        block
        v-model="labelRight"
      />
    </div>

    <template v-if="workbench.block?.type === 'rating'">
      <div class="mb-4" v-if="icon">
        <D9Label label="Icon" />
        <D9Select :options="iconOptions" v-model="icon" :icon="icon.icon" />
      </div>
      <div class="mb-4">
        <D9Label label="Color" />
        <D9Input type="color" v-model="color" block show-color-picker />
        <button type="button" class="text-xs text-blue-600" @click="resetColor">
          Use default
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input, D9Select } from "@deck9/ui";
import { watch, Ref, ref, onMounted } from "vue";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

const isInitialized = ref(false);
const startValue = ref(1);
const endValue = ref(5);
const color = ref("");
const labelLeft = ref("");
const labelRight = ref("");

const iconOptions = ref([
  { label: "Star", value: "star", icon: "star" },
  { label: "Heart", value: "heart", icon: "heart" },
  { label: "Poo", value: "poo", icon: "poo" },
  { label: "Bolt", value: "bolt", icon: "bolt" },
  { label: "Tree", value: "tree", icon: "tree" },
  { label: "Crown", value: "crown", icon: "crown" },
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
    interaction.value = await findOrCreate("range", workbench);

    // init settings
    startValue.value = interaction.value.options?.start ?? 1;
    endValue.value = interaction.value.options?.end ?? 5;
    color.value = interaction.value.options?.color ?? "";
    labelLeft.value = interaction.value.options?.labelLeft ?? "";
    labelRight.value = interaction.value.options?.labelRight ?? "";

    icon.value =
      iconOptions.value.find((i) => {
        return i.value === interaction.value.options?.icon;
      }) ?? iconOptions.value[0];

    isInitialized.value = true;
  }
});

const resetColor = () => {
  isInitialized.value = false;
  color.value = "";
  isInitialized.value = true;
};

watch(
  [startValue, endValue, icon, color, labelLeft, labelRight],
  (newValues) => {
    const update: { id: number } & Partial<FormBlockInteractionModel> = {
      id: interaction.value.id,
      options: {
        start: Number(newValues[0]),
        end: Number(newValues[1]),
        color: newValues[3] ?? undefined,
        labelLeft: newValues[4] ?? undefined,
        labelRight: newValues[5] ?? undefined,
      },
    };

    if (newValues[2]) {
      update.options = {
        ...update.options,
        icon: newValues[2].value,
      };
    }

    workbench.updateInteraction(update);
  }
);
</script>
