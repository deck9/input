<template>
  <div>
    <h2 class="mb-2 text-base font-bold">Settings</h2>

    <ConfigureInput v-if="workbench.block?.type === 'input'" />
    <ConfigureClicks
      v-if="
        workbench.block?.type === 'click' ||
        workbench.block?.type === 'multiple'
      "
    />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import ConfigureInput from "./ConfigureInput.vue";
import ConfigureClicks from "./ConfigureClicks.vue";

const workbench = useWorkbench();
</script>
