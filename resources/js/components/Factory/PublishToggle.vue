<template>
  <NavigationButton
    icon="globe"
    :color="store.form?.is_published ? 'primary' : 'light'"
    :is-loading="isPublishing"
    @click="togglePublish"
    >{{ store.form?.is_published ? "Unpublish" : "Publish" }}</NavigationButton
  >
</template>

<script setup lang="ts">
import NavigationButton from "./NavigationButton.vue";
import { useForm } from "@/stores";
import { ref } from "vue";

const store = useForm();

const isPublishing = ref(false);

const togglePublish = async () => {
  isPublishing.value = true;

  if (store.form?.is_published) {
    if (
      window.confirm(
        "Are you sure you want to unpublish this form? People will no longer be able to submit to it."
      )
    ) {
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
