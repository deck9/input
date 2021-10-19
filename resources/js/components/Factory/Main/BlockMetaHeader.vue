<template>
  <div class="mb-4 text-grey-500 text-xs font-mono flex justify-between">
    <div>
      <span class="text-xs mr-1">ID</span>
      <span class="bg-grey-300 inline-block leading-normal px-2 rounded">{{ block.uuid }}</span>
    </div>
    <div>
      <span class="text-xs mr-1">Last Change</span>
      <span class="bg-grey-300 inline-block leading-normal px-2 rounded">
        {{
          block.updated_at
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  block: FormBlockModel
}>()
</script>
