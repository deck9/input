<template>
  <div>
    <h2 class="mb-2 text-base font-bold">Input Settings</h2>

    <ConfigureClicks v-if="workbench.usesInteractionType === 'button'" />
    <ConfigureConsents v-if="workbench.usesInteractionType === 'consent'" />
    <ConfigureDate v-if="workbench.usesInteractionType === 'date'" />
    <ConfigureInput v-if="workbench.usesInteractionType === 'input'" />
    <ConfigureRange v-if="workbench.usesInteractionType === 'range'" />
    <ConfigureTextarea v-if="workbench.usesInteractionType === 'textarea'" />
    <ConfigureFile v-if="workbench.usesInteractionType === 'file'" />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import ConfigureClicks from "./ConfigureClicks.vue";
import ConfigureConsents from "./ConfigureConsents.vue";
import ConfigureDate from "./ConfigureDate.vue";
import ConfigureInput from "./ConfigureInput.vue";
import ConfigureRange from "./ConfigureRange.vue";
import ConfigureTextarea from "./ConfigureTextarea.vue";
import ConfigureFile from "./ConfigureFile.vue";

const workbench = useWorkbench();
</script>
