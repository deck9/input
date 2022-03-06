<template>
  <button
    class="group relative block w-full cursor-pointer overflow-visible rounded-md px-6 py-6 text-left shadow-sm"
    :class="cardStyle"
    @click="workbench.editFinalBlock()"
  >
    <div class="relative flex items-start">
      <div
        class="mr-2 flex-shrink-0 rounded py-1 text-center text-xs font-black text-grey-600"
      >
        <D9Icon name="trophy" />
      </div>

      <div class="flex w-full pr-4 font-medium">
        <div>Form Completion</div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { useWorkbench } from "@/stores";
import { useActiveCard } from "@/utils/useActiveCard";
import { storeToRefs } from "pinia";

const workbench = useWorkbench();
const { isEditingFinalBlock } = storeToRefs(workbench);

const { cardStyle } = useActiveCard(isEditingFinalBlock);
</script>
