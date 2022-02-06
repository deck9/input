<template>
  <div v-if="workbench.block" class="mx-auto max-w-xl px-4 py-4">
    <BlockMetaHeader :block="workbench.block" />

    <div class="space-y-8">
      <BlockType />
      <BlockMessage />

      <!-- Configurations -->
      <BlockInteractions v-if="workbench.needsInteractionSetup" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import BlockMetaHeader from "./BlockMetaHeader.vue";
import BlockMessage from "./BlockMessage.vue";
import BlockType from "./BlockType.vue";
import BlockInteractions from "./BlockInteractions.vue";

const workbench = useWorkbench();
</script>
