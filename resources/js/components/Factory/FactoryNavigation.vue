<template>
  <section v-if="store.form" class="w-full space-x-1 text-center text-sm">
    <NavigationButton icon="pencil-alt" route-name="forms.edit"
      >Edit</NavigationButton
    >
    <NavigationButton icon="cog" route-name="forms.settings"
      >Settings</NavigationButton
    >
    <NavigationButton icon="chart-pie" route-name="forms.results"
      >Results</NavigationButton
    >
  </section>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import NavigationButton from "./NavigationButton.vue";

const store = useForm();
</script>
