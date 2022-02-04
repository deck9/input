<template>
  <button
    class="group relative block w-full cursor-pointer overflow-visible rounded-xl bg-white px-6 py-4 text-left"
    @click="workbench.editFinalBlock()"
  >
    <div class="relative flex items-start">
      <div
        class="mt-px mr-4 w-10 flex-shrink-0 rounded-sm py-1 text-center text-xs font-black text-grey-50 transition duration-150"
        :class="
          workbench.isEditingFinalBlock
            ? 'bg-blue-600'
            : 'bg-grey-900 group-hover:bg-yellow-400 group-hover:text-yellow-900'
        "
      >
        <D9Icon name="check" />
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
