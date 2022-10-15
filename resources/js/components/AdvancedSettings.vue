<template>
  <div>
    <button class="text-xs text-grey-400" @click="open = !open">
      {{ title }}
      <D9Icon size="xs" :name="open ? 'chevron-down' : 'chevron-right'" />
    </button>

    <div class="mt-4" v-show="open">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { ref } from "vue";

defineProps<{
  title: string;
}>();

const open = ref(false);
</script>
