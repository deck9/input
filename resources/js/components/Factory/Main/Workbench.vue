<template>
  <div
    v-if="workbench.block"
    class="relative ml-24 flex h-full max-w-xl flex-col justify-between px-4 pt-8"
  >
    <div class="space-y-8 pb-24">
      <BlockMessage />
      <BlockType />
      <BlockInteractions v-if="workbench.needsInteractionSetup" />
    </div>

    <BlockMetaHeader class="py-4" :block="workbench.block" />
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
