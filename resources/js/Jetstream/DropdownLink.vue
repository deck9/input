<template>
  <div>
    <button
      type="submit"
      class="block w-full px-4 py-2 text-left text-sm leading-5 text-grey-700 transition hover:bg-grey-100 focus:bg-grey-100 focus:outline-none"
      v-if="as == 'button'"
    >
      <slot></slot>
    </button>

    <a
      :href="href"
      :target="target"
      class="block px-4 py-2 text-sm leading-5 text-grey-700 transition hover:bg-grey-100 focus:bg-grey-100 focus:outline-none"
      v-else-if="as == 'a'"
    >
      <slot></slot>
    </a>

    <Link
      :href="href"
      class="block px-4 py-2 text-sm leading-5 text-grey-700 transition hover:bg-grey-100 focus:bg-grey-100 focus:outline-none"
      v-else
    >
      <slot></slot>
    </Link>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Link } from "@inertiajs/inertia-vue3";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Link,
  },
  props: ["href", "as", "target"],
});
</script>
