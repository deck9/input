<template>
  <div class="z-20">
    <h2 class="mb-2 text-base font-bold">Group Name</h2>
    <D9Input v-model="title" block placeholder="Group" />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Input } from "@deck9/ui";
import { ref, watch } from "vue";

const workbench = useWorkbench();

const title = ref(workbench.block?.title || "");

watch([title], (newValue) => {
  if (newValue) {
    workbench.updateBlock({
      title: newValue[0],
    });
  }
});
</script>
