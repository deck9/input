<template>
  <div class="space-x-2">
    <D9Button
      label="Delete All"
      icon="trash"
      color="light"
      @click="purgeSubmissions"
    />
    <D9Button
      label="Download CSV"
      icon="cloud-download"
      color="dark"
      @click="downloadSubmissionsExport"
    />
  </div>
</template>

<script lang="ts" setup>
import { D9Button } from "@deck9/ui";
import { callPurgeSubmissions } from "@/api/forms";
import { useForm } from "@/stores";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();

const downloadSubmissionsExport = () => {
  window
    .open(
      window.route("forms.submissions-export", { form: props.form.uuid }),
      "_blank"
    )
    ?.focus();
};

const purgeSubmissions = async () => {
  let confirm = window.confirm(
    "Are you sure you want to delete all collected data for this form? This actions is not reversible"
  );

  if (confirm) {
    await callPurgeSubmissions(props.form);
    await store.refreshForm(true);
  }
};
</script>
