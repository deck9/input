<template>
  <div v-if="workbench.block" class="max-w-xl mx-auto px-4 py-4">
    <BlockMetaHeader :block="workbench.block" />

    <BlockType class="my-16" />
    <BlockMessage class="my-16" />

    <!-- Configurations -->
    <BlockInteractions v-if="workbench.needsInteractionSetup" class="my-16" />
  </div>
</template>


<script setup lang="ts">
import { useWorkbench } from '@/stores';
import BlockMetaHeader from './BlockMetaHeader.vue';
import BlockMessage from './BlockMessage.vue';
import BlockType from './BlockType.vue';
import BlockInteractions from './BlockInteractions.vue';

const workbench = useWorkbench();
</script>
