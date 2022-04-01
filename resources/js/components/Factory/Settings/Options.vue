<template>
  <div>
    <form @submit.prevent="saveOptions">
      <div class="mb-4">
        <D9Label label="Name" />
        <D9Input type="text" v-model="name" block />
      </div>

      <div class="mb-4">
        <D9Label label="Description" />
        <D9Input type="text" v-model="description" block />
      </div>

      <D9Button type="submit" label="Save Options" :is-loading="isSaving" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label, D9Input } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const isSaving = ref(false);

const name = ref(store?.form?.name);
const description = ref(store?.form?.description);

const saveOptions = async () => {
  isSaving.value = true;

  await store.updateForm({
    name: name.value,
    description: description.value,
  });

  isSaving.value = false;
};
</script>
