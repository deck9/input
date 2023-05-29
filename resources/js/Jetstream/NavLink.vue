<template>
  <Link :href="href" :class="classes">
    <slot />
  </Link>
</template>

<script>
import { defineComponent } from "vue";
import { Link } from "@inertiajs/inertia-vue3";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Link,
  },
  props: ["href", "active"],

  computed: {
    classes() {
      return this.active
        ? "inline-flex items-center px-1 text-sm font-bold text-grey-100 focus:outline-none transition"
        : "inline-flex items-center px-1 text-sm font-medium text-grey-400 hover:text-grey-100 focus:outline-none focus:text-grey-200 transition";
    },
  },
});
</script>
