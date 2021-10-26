<template>
  <div>
    <ConfigureInput v-if="workbench.block?.type === 'input'" />
    <ConfigureClick
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
import ConfigureClick from "./ConfigureClick.vue";

const workbench = useWorkbench();
</script>
