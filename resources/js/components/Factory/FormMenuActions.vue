<template>
  <div class="text-sm space-x-4" v-if="store.form">
    <a
      class="text-grey-400 hover:text-grey-100 focus:text-grey-200 transition"
      href="#"
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
