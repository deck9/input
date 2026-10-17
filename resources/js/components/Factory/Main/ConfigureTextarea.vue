<template>
  <div>
    <div class="mb-4">
      <D9Label id="textarea-placeholder" label="Placeholder" />
      <D9Input
        id="textarea-placeholder"
        placeholder="Your placeholder text"
        type="text"
        block
        v-model="label"
      />
    </div>
    <div class="mb-4">
      <D9Label
        id="textarea-rows"
        label="Height in lines"
        description="1 to 10"
      />
      <D9Input
        id="textarea-rows"
        placeholder="e.g. 4"
        type="number"
        step="1"
        block
        v-model="rows"
        @input="rowsBad = isBadInput($event)"
        :aria-invalid="!rowsValid"
        aria-describedby="textarea-rows-error"
      />
      <p
        v-if="!rowsValid"
        id="textarea-rows-error"
        role="alert"
        class="mt-1 text-xs text-red-600"
      >
        Use a whole number from 1 to 10, or leave it empty.
      </p>
    </div>
    <div class="mb-4">
      <D9Label id="textarea-max-chars" label="Max characters" />
      <D9Input
        id="textarea-max-chars"
        placeholder="No limit"
        type="number"
        block
        v-model="maxChars"
        @input="maxCharsBad = isBadInput($event)"
        :aria-invalid="!maxCharsValid"
        aria-describedby="textarea-max-chars-error"
      />
      <p
        v-if="!maxCharsValid"
        id="textarea-max-chars-error"
        role="alert"
        class="mt-1 text-xs text-red-600"
      >
        Use a whole number from 1, or leave it empty for no limit.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input } from "@deck9/ui";
import { Ref, computed, ref, onMounted } from "vue";
import { useInteractionsUtils } from "../utils/useInteractionsUtils";
import { useSettingsWatch } from "../utils/useSettingsWatch";

const workbench = useWorkbench();
const { findOrCreate } = useInteractionsUtils();

const label = ref<FormBlockInteractionModel["label"]>("");
// empty means the default height
const rows = ref<number | "">(5);
// empty means no limit; a new question starts at 500
const maxChars = ref<number | "">(500);
// a whole number from 1, or empty; anything else is never saved
const isWhole = (value: number | string | null | undefined) =>
  value === "" ||
  value == null ||
  (Number.isInteger(Number(value)) && Number(value) >= 1);
// a half-typed "-" or "2." reads as an empty value, the browser flags it
const rowsBad = ref(false);
const maxCharsBad = ref(false);
const isBadInput = (event: Event) =>
  (event.target as HTMLInputElement).validity.badInput;
const rowsValid = computed(
  () => !rowsBad.value && isWhole(rows.value) && Number(rows.value) <= 10,
);
const maxCharsValid = computed(
  () => !maxCharsBad.value && isWhole(maxChars.value),
);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

onMounted(async () => {
  // find or create interaction
  if (workbench.block?.interactions) {
    const isNew = !workbench.block.interactions.some(
      (item) => item.type === "textarea",
    );
    interaction.value = await findOrCreate("textarea", workbench);

    label.value = interaction.value.label;
    // a saved 0 or negative number means no limit on the public form
    const savedRows = interaction.value.options?.rows;
    const savedMax = interaction.value.options?.max_chars;
    rows.value = isNew ? 5 : isWhole(savedRows) ? (savedRows ?? "") : "";
    maxChars.value = isNew ? 500 : isWhole(savedMax) ? (savedMax ?? "") : "";
    await settled(isNew);
  }
});

const settled = useSettingsWatch(
  [label, rows, maxChars, rowsBad, maxCharsBad],
  (newValues) => {
    // a wrong number is never saved, nor the number typed on the way to it
    if (!rowsValid.value) {
      workbench.keepSentOption(interaction.value.id, "rows");
    }
    if (!maxCharsValid.value) {
      workbench.keepSentOption(interaction.value.id, "max_chars");
    }
    if (!rowsValid.value || !maxCharsValid.value) return;

    const update = {
      id: interaction.value.id,
      label: newValues[0],
      options: {
        rows: newValues[1] === "" ? null : Number(newValues[1]),
        max_chars: newValues[2] === "" ? null : Number(newValues[2]),
      },
    };

    workbench.updateInteraction(update);
  },
);
</script>
