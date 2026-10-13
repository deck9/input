<template>
  <div v-if="isInitialized">
    <div class="mb-4">
      <D9Label id="range-min" label="Min Rating" />
      <D9Input
        id="range-min"
        placeholder="Min Rating"
        type="number"
        block
        v-model="startValue"
      />
    </div>
    <div class="mb-4">
      <D9Label id="range-max" label="Max Rating" />
      <D9Input
        id="range-max"
        placeholder="Max Rating"
        type="number"
        block
        v-model="endValue"
      />
    </div>

    <div class="mb-4">
      <D9Label id="range-label-left" label="Left Label" />
      <D9Input
        id="range-label-left"
        placeholder="Left Label"
        type="text"
        block
        v-model="labelLeft"
      />
    </div>
    <div class="mb-4">
      <D9Label id="range-label-right" label="Right Label" />
      <D9Input
        id="range-label-right"
        placeholder="Right Label"
        type="text"
        block
        v-model="labelRight"
      />
    </div>

    <template v-if="workbench.block?.type === 'rating'">
      <div class="mb-4" v-if="icon">
        <D9Label id="range-icon" label="Icon" />
        <D9Select
          id="range-icon"
          :options="iconOptions"
          v-model="icon"
          :icon="icon.icon"
        />
      </div>
      <div class="mb-4">
        <D9Label id="range-color" label="Color" />
        <D9Input
          id="range-color"
          type="color"
          v-model="color"
          block
          show-color-picker
        />
        <button
          type="button"
          class="inline-flex min-h-11 items-center text-xs text-blue-600 lg:min-h-0"
          @click="resetColor"
        >
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
  { id: "star", label: "Star", value: "star", icon: "star" },
  { id: "heart", label: "Heart", value: "heart", icon: "heart" },
  { id: "poo", label: "Poo", value: "poo", icon: "poo" },
  { id: "bolt", label: "Bolt", value: "bolt", icon: "bolt" },
  { id: "tree", label: "Tree", value: "tree", icon: "tree" },
  { id: "crown", label: "Crown", value: "crown", icon: "crown" },
  { id: "trophy", label: "Trophy", value: "trophy", icon: "trophy" },
]);

const icon = ref<{
  id: string;
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
