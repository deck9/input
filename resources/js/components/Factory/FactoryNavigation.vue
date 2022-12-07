<template>
  <section
    v-if="store.formId"
    class="flex w-full space-x-1 text-center text-sm"
  >
    <NavigationButton icon="chevron-left" :href="route('dashboard')"
      >Dashboard</NavigationButton
    >
    <NavigationSpacer />
    <NavigationButton
      icon="pencil-alt"
      :href="route('forms.edit', { uuid: store.formId })"
      >Edit</NavigationButton
    >
    <NavigationButton
      icon="cog"
      :href="route('forms.settings', { uuid: store.formId })"
      >Settings</NavigationButton
    >
    <NavigationButton
      icon="file-text"
      :href="route('forms.submissions', { uuid: store.formId })"
      >Submissions</NavigationButton
    >
    <NavigationButton
      icon="chart-pie"
      :href="route('forms.summary', { uuid: store.formId })"
      >Summary</NavigationButton
    >
    <NavigationSpacer />
    <NavigationButton icon="play-circle" :href="store.formUrl" target="_blank"
      >Preview</NavigationButton
    >
    <PublishToggle />
  </section>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import NavigationButton from "./NavigationButton.vue";
import PublishToggle from "./PublishToggle.vue";
import NavigationSpacer from "./NavigationSpacer.vue";

const store = useForm();
</script>
