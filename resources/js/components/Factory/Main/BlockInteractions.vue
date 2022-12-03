<template>
  <div>
    <h2 class="mb-2 text-base font-bold">Input Settings</h2>

    <ConfigureInput v-if="workbench.usesInteractionType === 'input'" />
    <ConfigureTextarea v-if="workbench.usesInteractionType === 'textarea'" />
    <ConfigureClicks v-if="workbench.usesInteractionType === 'button'" />
    <ConfigureConsents v-if="workbench.usesInteractionType === 'consent'" />
    <ConfigureRange v-if="workbench.usesInteractionType === 'range'" />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import ConfigureInput from "./ConfigureInput.vue";
import ConfigureClicks from "./ConfigureClicks.vue";
import ConfigureConsents from "./ConfigureConsents.vue";
import ConfigureTextarea from "./ConfigureTextarea.vue";
import ConfigureRange from "./ConfigureRange.vue";

const workbench = useWorkbench();
</script>
