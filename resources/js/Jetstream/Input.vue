<template>
  <input
    class="
      block
      w-full
      px-3
      py-2
      border border-grey-300
      focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200
      rounded-md
      placeholder-grey-400
      transition
      duration-150
      ease-in-out
      sm:text-sm sm:leading-5
    "
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    ref="input"
  />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: ["modelValue"],

  emits: ["update:modelValue"],

  methods: {
    focus() {
      this.$refs.input.focus();
    },
  },
});
</script>
