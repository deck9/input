<template>
  <div>
    <ConfigureInput v-if="workbench.block?.type === 'input'" />
    <ConfigureClick v-if="workbench.block?.type === 'click'" />
    <ConfigureMultiple v-if="workbench.block?.type === 'multiple'" />
  </div>
</template>


<script setup lang="ts">
import { useWorkbench } from '@/stores';
import ConfigureInput from './ConfigureInput.vue';
import ConfigureClick from './ConfigureClick.vue';
import ConfigureMultiple from './ConfigureMultiple.vue';

const workbench = useWorkbench()
</script>
