<template>
  <button
    :type="type"
    class="inline-flex items-center rounded-md border border-transparent bg-grey-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-grey-700 focus:border-grey-900 focus:outline-none focus:ring focus:ring-grey-300 active:bg-grey-900 disabled:opacity-25"
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
      default: "submit",
    },
  },
});
</script>
