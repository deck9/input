<template>
  <button
    class="relative block w-full px-6 py-4 overflow-visible text-left bg-white cursor-pointer rounded-xl group"
    @click="workbench.editFinalBlock()"
  >
    <div class="relative flex items-start">
      <div
        class="flex-shrink-0 w-10 py-1 mt-px mr-4 text-xs font-black text-center transition duration-150 rounded-sm text-grey-50"
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
import { useWorkbench, useForm } from "@/stores";

const workbench = useWorkbench();
const store = useForm();
</script>
