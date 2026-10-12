<template>
  <div class="rounded-lg border border-grey-200 bg-white">
    <!-- each row names its own values, so screen readers skip the header -->
    <div
      aria-hidden="true"
      class="hidden border-b border-grey-200 px-4 py-3.5 text-left text-sm font-semibold text-grey-900 lg:grid lg:grid-cols-[minmax(0,1fr)_8rem_11rem_9rem_7rem] lg:gap-4"
    >
      <div>Name</div>
      <div>Status</div>
      <div>Submissions</div>
      <div>Last edited</div>
      <div></div>
    </div>
    <ul v-if="forms.length" role="list" class="divide-y divide-grey-200">
      <FormListItem :form="form" :key="form.id" v-for="form in forms" />
    </ul>
    <!-- what to show instead of rows: loading or no match -->
    <slot v-else />
  </div>
</template>

<script lang="ts" setup>
import FormListItem from "@/components/Dashboard/FormListItem.vue";

defineProps<{
  forms: Array<FormModel>;
}>();
</script>
