<template>
  <div>
    <ConfigureInput v-if="workbench.block?.type === 'input'" />
  </div>
</template>


<script setup lang="ts">
import { useWorkbench } from '@/stores';
import ConfigureInput from './ConfigureInput.vue';

const workbench = useWorkbench()
</script>
