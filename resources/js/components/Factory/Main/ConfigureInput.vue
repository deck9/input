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
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Label, D9Input } from "@deck9/ui";
import { watch, Ref, ref } from "vue";
import { onMounted } from "@vue/runtime-core";

const workbench = useWorkbench();

interface ValidationOption {
  id: FormBlockInteractionModel["has_validation"];
  label: string;
}

const options: ValidationOption[] = [
  { id: "none", label: "No validation" },
  { id: "email", label: "E-Mail Address" },
  { id: "url", label: "Web Address / URL" },
  { id: "numeric", label: "Numeric" },
];

const label: Ref<FormBlockInteractionModel["label"]> = ref("");
const selected: Ref<ValidationOption> = ref(options[0]);
const interaction = ref(null) as unknown as Ref<FormBlockInteractionModel>;

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

    selected.value =
      options.find((o) => o.id === interaction.value.has_validation) ??
      options[0];
    label.value = interaction.value.label;

    watch([label, selected], (newValues) => {
      const update = {
        id: interaction.value.id,
        label: newValues[0],
        has_validation: newValues[1].id,
      };

      workbench.updateInteraction(update);
    });
  }
});
</script>
