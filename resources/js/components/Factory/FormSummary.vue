<template>
  <div>
    <h2 class="text-slate-900 mb-2 text-lg font-bold">{{ form.name }}</h2>
    <div class="grid grid-cols-2 gap-2 text-sm text-grey-400">
      <div>
        <div><D9Icon name="user" /></div>
        <span class="font-semibold">{{ form.total_sessions }}</span>
        sessions
      </div>
      <div>
        <div><D9Icon name="trophy" /></div>
        <span class="font-semibold">{{ form.completed_sessions }}</span>
        submitted ({{ form.completion_rate }}%)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";

defineProps<{
  form: FormModel;
  blocks?: FormBlockModel[];
}>();
</script>
