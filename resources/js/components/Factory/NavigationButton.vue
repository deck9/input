<template>
  <a
    class="rounded px-3 py-2 text-center font-medium text-grey-300"
    :class="isActive ? 'bg-grey-900' : 'hover:bg-grey-700'"
    :href="resolvedRoute"
  >
    <D9Icon :name="icon" />
    <span class="mt-px block text-center text-xs">
      <slot></slot>
    </span>
  </a>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { useForm } from "@/stores";
import { computed } from "@vue/reactivity";

const store = useForm();
const props = defineProps<{
  icon: string;
  routeName: string;
}>();

const resolvedRoute = store.form
  ? window.route(props.routeName, { uuid: store.form?.uuid })
  : "";

const isActive = computed((): boolean => {
  if (!store.form) {
    return false;
  }

  const origin = document.location.origin;
  const pathname = document.location.pathname;
  return origin + pathname === resolvedRoute;
});
</script>
