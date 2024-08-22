<template>
  <div>
    <div class="flex justify-between">
      <D9Label label="Randomize Responses" />
      <D9Switch
        label=""
        v-model="randomizeResponses"
        onLabel="yes"
        offLabel="no"
        @change="updateRandomizeResponsesSetting"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useWorkbench } from "@/stores/workbench";
import { D9Label, D9Switch } from "@deck9/ui";
import { ref } from "vue";

const workbench = useWorkbench();

const randomizeResponses = ref(
  workbench.block?.options?.randomize_responses ?? false,
);

const updateRandomizeResponsesSetting = () => {
  if (workbench.block && !workbench.block.options) {
    workbench.block.options = {};
  }

  if (workbench.block?.options) {
    workbench.block.options.randomize_responses = randomizeResponses.value;
  }

  workbench.updateBlock({
    options: workbench.block?.options,
  });
};
</script>
