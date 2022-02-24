<template>
  <div class="z-20">
    <h2 class="mb-2 text-base font-bold">Type</h2>
    <D9Select
      class="mb-2"
      v-model="selected"
      placeholder="Please select a type"
      size="large"
      :options="types"
      icon="chevron-right"
    />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Select } from "@deck9/ui";
import { ref, Ref, watch } from "vue";

const workbench = useWorkbench();

type InteractionOption = {
  id: number;
  label: string;
  value: FormBlockModel["type"];
  icon?: string;
};

const types: Ref<Array<InteractionOption>> = ref([
  { id: 1, label: "No Inputs", value: "message", icon: "envelope" },
  { id: 2, label: "Single Choice", value: "click", icon: "envelope" },
  { id: 3, label: "Multiple Choice", value: "multiple", icon: "envelope" },
  { id: 4, label: "Input", value: "input", icon: "envelope" },
]) as Ref<Array<InteractionOption>>;

const matched = types.value.find((type) => {
  return type.value === workbench.block?.type;
});

const selected: Ref<InteractionOption | undefined> = matched
  ? ref(matched)
  : ref(undefined);

watch(selected, (newValue) => {
  if (newValue?.value) {
    workbench.updateBlock({
      type: newValue.value,
    });
  }
});
</script>
