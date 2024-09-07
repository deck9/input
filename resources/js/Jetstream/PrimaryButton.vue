<script setup>
defineProps({
  type: {
    type: String,
    default: "submit",
  },
});
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center px-4 py-2 bg-grey-800 dark:bg-grey-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-grey-800 uppercase tracking-widest hover:bg-grey-700 dark:hover:bg-white focus:bg-grey-700 dark:focus:bg-white active:bg-grey-900 dark:active:bg-grey-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-grey-800 disabled:opacity-50 transition ease-in-out duration-150"
  >
    <slot />
  </button>
</template>
