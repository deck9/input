<template>
  <D9Icon v-if="iconName" class="fill-current" :name="iconName" />
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { D9Icon } from "@deck9/ui";

const props = defineProps<{
  type: string;
}>();

const iconName = computed((): string | false => {
  switch (props.type) {
    case "multiple":
      return "plus-circle";
    case "click":
      return "hand-point-right";
    case "input":
      return "pencil-alt";
    case "message":
      return "envelope";

    default:
      return false;
  }
});
</script>
