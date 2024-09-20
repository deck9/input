<template>
  <div>
    <h2 class="mb-4 text-base font-bold">Message</h2>
    <Editor v-model="content" v-bind="{ counter: true }" />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { ref } from "vue";
import Editor from "@/components/Factory/Shared/Editor.vue";
import { watch } from "vue";

const workbench = useWorkbench();
const content = ref(workbench.block?.message ?? "");

watch(content, (newValue) => {
  workbench.updateBlock({
    message: newValue,
  });
});
</script>
