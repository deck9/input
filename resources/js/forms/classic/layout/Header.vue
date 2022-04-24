<template>
  <div v-if="form?.avatar" class="py-4">
    <img
      class="h-12 w-auto object-contain"
      :src="form.avatar"
      :alt="form.name"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form?: PublicFormModel;
}>();
</script>
