<template>
  <div class="bg-grey-900 px-8 py-6 font-mono text-xs text-grey-400">
    <pre class="">{{ form }}</pre>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  form: FormModel;
}>();
</script>
