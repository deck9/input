<template>
  <div>
    <div class="flex justify-between">
      <D9Label id="randomize-responses" label="Shuffle choices" />
      <D9Switch
        id="randomize-responses"
        label=""
        v-model="randomizeResponses"
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
