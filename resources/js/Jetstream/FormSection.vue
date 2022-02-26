<template>
  <div class="md:grid md:grid-cols-3 md:gap-6">
    <jet-section-title>
      <template #title><slot name="title"></slot></template>
      <template #description><slot name="description"></slot></template>
    </jet-section-title>

    <div class="mt-5 md:col-span-2 md:mt-0">
      <form @submit.prevent="$emit('submitted')">
        <div
          class="bg-white px-4 py-5 shadow sm:p-6"
          :class="
            hasActions ? 'sm:rounded-tl-md sm:rounded-tr-md' : 'sm:rounded-md'
          "
        >
          <div class="grid grid-cols-6 gap-6">
            <slot name="form"></slot>
          </div>
        </div>

        <div
          class="flex items-center justify-end bg-grey-50 px-4 py-3 text-right shadow sm:rounded-bl-md sm:rounded-br-md sm:px-6"
          v-if="hasActions"
        >
          <slot name="actions"></slot>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import JetSectionTitle from "./SectionTitle.vue";

export default defineComponent({
  emits: ["submitted"],

  components: {
    JetSectionTitle,
  },

  computed: {
    hasActions() {
      return !!this.$slots.actions;
    },
  },
});
</script>
