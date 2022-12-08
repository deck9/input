<template>
  <component
    :is="target ? 'a' : Link"
    class="flex flex-col justify-center rounded px-3 py-2 text-center font-medium ring-offset-2 ring-offset-grey-800 focus:outline-none focus:ring-2 focus:ring-grey-600"
    :class="[
      isActive ? 'bg-grey-900 text-grey-300' : '',
      {
        'bg-white text-grey-900': color === 'light',
        'bg-blue-500 text-grey-100': color === 'primary',
        'bg-transparent text-grey-300 hover:bg-grey-700':
          color !== 'primary' && color !== 'light' && !isActive,
      },
    ]"
    :href="href ?? '#'"
    :target="href && target ? target : undefined"
    @click="processClick"
  >
    <D9Icon :name="icon" />
    <span class="mt-px hidden text-center text-xs lg:block">
      <slot></slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { Link } from "@inertiajs/inertia-vue3";
import { useForm } from "@/stores";
import { computed } from "vue";

const store = useForm();
const props = defineProps<{
  icon: string;
  routeName?: string;
  href?: string;
  target?: string;
  color?: "light" | "primary";
}>();

const emit = defineEmits<{
  (event: "click", payload: Event): void;
}>();

const resolvedRoute = computed(() => {
  if (props.href) {
    return props.href;
  }

  if (props.routeName) {
    return store.form
      ? window.route(props.routeName, { uuid: store.form?.uuid })
      : "";
  }

  return "";
});

const isActive = computed((): boolean => {
  if (!store.form) {
    return false;
  }

  const origin = document.location.origin;
  const pathname = document.location.pathname;
  return origin + pathname === resolvedRoute.value;
});

const processClick = (e) => {
  if (props.routeName || props.href) {
    return;
  }

  e.preventDefault();
  emit("click", e);
};
</script>
