<template>
  <button
    class="relative block w-full text-left cursor-pointer px-6 py-4 group overflow-visible"
    @click="workbench.editFinalBlock()"
  >
    <div class="flex items-start relative">
      <div
        class="mt-px mr-4 flex-shrink-0 py-1 w-10 text-center font-black text-xs rounded-sm transition duration-150 text-grey-50"
        :class="workbench.isEditingFinalBlock ? 'bg-blue-600' : 'bg-grey-900 group-hover:bg-yellow-300'"
      >
        <D9Icon name="check" />
      </div>

      <div class="flex w-full pr-4 font-medium">
        <div class="mb-2">Final Block</div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui"
import { useWorkbench, useForm } from "@/stores"

const workbench = useWorkbench()
const store = useForm()
</script>
