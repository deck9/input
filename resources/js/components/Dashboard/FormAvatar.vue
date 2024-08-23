<template>
  <div class="h-11 w-11 flex-shrink-0">
    <div
      class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full p-2"
      :style="`background-color: ${form.brand_color ?? '#232323'};`"
    >
      <span
        class="text-base font-medium font-mono tracking-wide uppercase"
        :style="`color: ${form.contrast_color}`"
        >{{ form.initials }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form: FormModel;
}>();
</script>
