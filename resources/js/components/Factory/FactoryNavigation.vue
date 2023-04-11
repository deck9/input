<template>
  <section v-if="store.formId" class="flex gap-2 text-center text-sm">
    <NavigationButton icon="chevron-left" :href="route('dashboard')"
      >Dashboard</NavigationButton
    >

    <NavigationSpacer />

    <FactoryFormDropdown />

    <NavigationButton
      icon="pencil-alt"
      :href="route('forms.edit', { uuid: store.formId })"
      >Editor</NavigationButton
    >
    <NavigationButton
      icon="cog"
      :href="route('forms.settings', { uuid: store.formId })"
      >Settings</NavigationButton
    >
    <NavigationButton
      icon="puzzle-piece"
      :href="route('forms.integrations', { uuid: store.formId })"
      >Integrations</NavigationButton
    >
    <NavigationButton
      icon="chart-pie"
      :href="route('forms.submissions', { uuid: store.formId })"
      >Results</NavigationButton
    >
    <!-- <NavigationButton
      icon="chart-pie"
      :href="route('forms.summary', { uuid: store.formId })"
      >Summary</NavigationButton
    > -->

    <NavigationSpacer />

    <NavigationButton icon="play-circle" :href="store.formUrl" target="_blank"
      >Preview</NavigationButton
    >
  </section>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import NavigationButton from "./NavigationButton.vue";
import FactoryFormDropdown from "./FactoryFormDropdown.vue";
import NavigationSpacer from "./NavigationSpacer.vue";

const store = useForm();
</script>
