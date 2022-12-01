<template>
  <section v-if="store.form" class="flex w-full space-x-1 text-center text-sm">
    <NavigationButton icon="pencil-alt" route-name="forms.edit"
      >Edit</NavigationButton
    >
    <NavigationButton icon="cog" route-name="forms.settings"
      >Settings</NavigationButton
    >
    <NavigationButton icon="file-text" route-name="forms.submissions"
      >Submissions</NavigationButton
    >
    <NavigationButton icon="chart-pie" route-name="forms.summary"
      >Summary</NavigationButton
    >
  </section>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import NavigationButton from "./NavigationButton.vue";

const store = useForm();
</script>
