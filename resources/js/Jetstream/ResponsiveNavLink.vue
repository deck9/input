<template>
  <div>
    <button :class="classes" class="w-full text-left" v-if="as == 'button'">
      <slot></slot>
    </button>

    <Link :href="href" :class="classes" v-else>
      <slot />
    </Link>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Link } from "@inertiajs/vue3";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Link,
  },
  props: ["active", "href", "as"],

  computed: {
    classes() {
      return this.active
        ? "block pl-3 pr-4 py-2 border-l-4 border-blue-400 text-base font-medium text-blue-700 bg-blue-50 focus:outline-none focus:text-blue-800 focus:bg-blue-100 focus:border-blue-700 transition"
        : "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-grey-600 hover:text-grey-800 hover:bg-grey-50 hover:border-grey-300 focus:outline-none focus:text-grey-800 focus:bg-grey-50 focus:border-grey-300 transition";
    },
  },
});
</script>
