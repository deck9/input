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
import { useBlockTypes } from "../utils/useBlockTypes";

const workbench = useWorkbench();

const { types } = useBlockTypes();

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
