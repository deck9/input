<template>
  <div class="space-x-4 text-sm" v-if="store.form">
    <a
      class="text-grey-400 transition hover:text-grey-100 focus:text-grey-200"
      :href="store.formUrl"
      target="_blank"
    >
      <D9Icon class="mr-1" name="play-circle"></D9Icon>View Form
    </a>
    <D9Button
      :label="store.form?.is_published ? 'Unpublish' : 'Publish'"
      icon="globe"
      icon-position="left"
      :color="store.form?.is_published ? 'light' : 'primary'"
      :is-loading="isPublishing"
      @click="togglePublish"
    />
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Icon, D9Button } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();

const isPublishing = ref(false);

const togglePublish = async () => {
  isPublishing.value = true;

  if (store.form?.is_published) {
    if (window.confirm("Are you sure you want to unpublish this form?")) {
      await store.unpublishForm();
    }
  } else {
    if (window.confirm("Do you want to publish this form?")) {
      await store.publishForm();
    }
  }

  isPublishing.value = false;
};
</script>
