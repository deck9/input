<template>
  <label class="block text-sm font-medium leading-5 text-grey-700">
    <span v-if="value">{{ value }}</span>
    <span v-else><slot></slot></span>
  </label>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: ["value"],
});
</script>
