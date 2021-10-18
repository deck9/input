<template>
  <div v-if="workbench.block" class="max-w-xl mx-auto px-4 py-4">
    <BlockMetaHeader :block="workbench.block" />

    <BlockMessage class="my-16" />

    <div class="my-16">
      <D9Label class="mb-2" id="interactions" label="Type" />
      <BlockType />
    </div>

    <div class="my-16">
      <D9Label class="mb-2" id="interactions" label="Interactions" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { useWorkbench } from '@/stores';
import { D9Label } from '@deck9/ui';
import BlockMetaHeader from './BlockMetaHeader.vue';
import BlockMessage from './BlockMessage.vue';
import BlockType from './BlockType.vue';

const workbench = useWorkbench();
</script>
