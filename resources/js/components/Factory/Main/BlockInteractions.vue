<template>
  <div>
    <InputEditor v-if="workbench.block?.type === 'input'" />
  </div>
</template>


<script setup lang="ts">
import { useWorkbench } from '@/stores';
import InputEditor from './InputEditor.vue';


const workbench = useWorkbench()
</script>
