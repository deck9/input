<template>
  <div>
    <h1 class="text-slate-900 text-xl font-bold">{{ form.name }}</h1>
    <div class="flex space-x-5 text-sm text-grey-400">
      <div>
        <D9Icon class="mr-2" name="envelope" />
        <span class="font-semibold">{{ blocks?.length ?? 0 }}</span> blocks
      </div>
      <div>
        <D9Icon class="mr-2" name="user" />
        <span class="font-semibold">{{ form.total_sessions }}</span> sessions
      </div>
      <div>
        <D9Icon class="mr-2" name="trophy" />
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
