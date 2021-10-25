<template>
  <a
    class="text-grey-300 font-medium px-4 py-2 rounded"
    :class="isActive ? 'bg-grey-900' : 'hover:bg-grey-700'"
    :href="resolvedRoute"
  >
    <D9Icon class="mr-2" name="chart-pie" />
    <slot></slot>
  </a>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui"
import { useForm } from '@/stores';
import { computed } from '@vue/reactivity';

const store = useForm()
const props = defineProps<{
  icon: string
  routeName: string
}>()

const resolvedRoute = store.form ? window.route(props.routeName, { uuid: store.form?.uuid }) : ''

const isActive = computed((): boolean => {
  if (!store.form) {
    return false;
  }

  const origin = document.location.origin
  const pathname = document.location.pathname
  return origin + pathname === resolvedRoute;
})
</script>
