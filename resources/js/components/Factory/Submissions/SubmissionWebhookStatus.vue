<template>
  <div class="inline-flex cursor-pointer items-center" v-tooltip="'200 OK'">
    <span class="mr-1 inline-block h-3 w-3 rounded-full bg-green-400"></span>
    <span>{{ name }}</span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  name: string;
}>();
</script>
