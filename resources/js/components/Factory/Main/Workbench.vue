<template>
  <div
    v-if="workbench.block"
    class="relative mx-12 flex h-full max-w-xl flex-col justify-between px-4 pt-8 xl:mx-24"
  >
    <div class="space-y-8 pb-24">
      <template v-if="workbench.block.type === 'group'"> </template>
      <template v-else>
        <BlockMessage />
        <BlockType />
        <BlockInteractions v-if="workbench.needsInteractionSetup" />
      </template>
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
import { provide } from "@vue/runtime-core";

const workbench = useWorkbench();

provide("block", workbench.block);
</script>
