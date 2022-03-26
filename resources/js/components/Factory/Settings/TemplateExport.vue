<template>
  <div>
    <div class="mb-4">
      <D9Label label="Name" />
      <textarea
        v-if="template"
        class="mono-50 block w-full rounded border-grey-300 bg-white py-3 pl-4 pr-10 text-sm leading-4 text-grey-800 placeholder:font-normal placeholder:text-grey-400 focus:border-blue-400 focus:ring-blue-400 dark:border-grey-700 dark:bg-grey-800 dark:text-grey-100 dark:placeholder:text-grey-500 dark:focus:border-blue-800 dark:focus:ring-blue-800"
        rows="10"
        readonly
        :value="template"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { callGetFormTemplate } from "@/api/forms";
import { useForm } from "@/stores";
import { D9Label } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const template = ref<string | null>(null);

callGetFormTemplate(store.form?.id).then((response) => {
  template.value = JSON.stringify(response.data);
});
</script>
