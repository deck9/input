<template>
  <button
    class="group relative block w-full cursor-pointer overflow-visible rounded-md border px-6 py-4 text-left shadow-sm"
    :class="
      workbench.isEditingFinalBlock
        ? 'border-grey-300 bg-grey-200'
        : 'border-grey-200 bg-white bg-opacity-90 backdrop-blur-sm'
    "
    @click="workbench.editFinalBlock()"
  >
    <div class="relative flex items-start">
      <div
        class="mr-2 flex-shrink-0 rounded py-1 text-center text-xs font-black text-grey-600"
      >
        <D9Icon name="trophy" />
      </div>

      <div class="flex w-full pr-4 font-medium">
        <div>Final Block</div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { useWorkbench } from "@/stores";

const workbench = useWorkbench();
</script>
