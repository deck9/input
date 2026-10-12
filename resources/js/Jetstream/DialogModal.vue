<template>
  <modal
    :show="show"
    :max-width="maxWidth"
    :closeable="closeable"
    @close="close"
  >
    <div role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="px-6 py-4">
        <div :id="titleId" class="text-lg">
          <slot name="title"> </slot>
        </div>

        <div class="mt-4">
          <slot name="content"> </slot>
        </div>
      </div>

      <div class="bg-grey-100 px-6 py-4 text-right">
        <slot name="footer"> </slot>
      </div>
    </div>
  </modal>
</template>

<script>
import { defineComponent, useId } from "vue";
import Modal from "./Modal.vue";

export default defineComponent({
  emits: ["close"],

  components: {
    Modal,
  },

  props: {
    show: {
      default: false,
    },
    maxWidth: {
      default: "2xl",
    },
    closeable: {
      default: true,
    },
  },

  setup() {
    return { titleId: useId() };
  },

  methods: {
    close() {
      this.$emit("close");
    },
  },
});
</script>
