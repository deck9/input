<template>
  <div
    class="mx-auto mt-8 grid max-w-screen-sm gap-6 lg:max-w-none lg:grid-cols-2"
  >
    <BlockSubmissionItem
      :block="block"
      v-for="block in store.blocks"
      :key="block.id"
    />
  </div>
</template>

<script lang="ts" setup>
import BlockSubmissionItem from "@/components/Factory/Submissions/BlockSubmissionItem.vue";
import { useForm } from "@/stores";

defineProps<{
  form: FormModel;
}>();
const store = useForm();
</script>
