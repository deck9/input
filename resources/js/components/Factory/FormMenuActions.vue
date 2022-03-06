<template>
  <div class="space-x-4 text-sm" v-if="store.form">
    <a
      class="text-grey-400 transition hover:text-grey-100 focus:text-grey-200"
      :href="store.formUrl"
    >
      <D9Icon class="mr-1" name="play-circle"></D9Icon>View Form
    </a>
    <D9Button label="Publish" icon="globe" icon-position="left" />
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Icon, D9Button } from "@deck9/ui";

const store = useForm();
</script>
