<template>
  <button
    :type="type"
    class="inline-flex items-center rounded-md border border-grey-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-grey-700 shadow-sm transition hover:text-grey-500 focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-200 active:bg-grey-50 active:text-grey-800 disabled:opacity-25"
  >
    <slot></slot>
  </button>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    type: {
      type: String,
      default: "button",
    },
  },
});
</script>
