<template>
  <div>
    <AvatarUpload class="mb-4" />

    <div class="mb-4">
      <D9Label label="Name" />
      <D9Input type="text" :value="store?.form?.name" block />
    </div>

    <div class="mb-4">
      <D9Label label="Description" />
      <D9Input type="text" block :value="store?.form?.description" />
    </div>

    <D9Button label="Save Options" />
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label, D9Input } from "@deck9/ui";
import AvatarUpload from "./partials/AvatarUpload.vue";

const store = useForm();
</script>
