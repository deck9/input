<template>
  <app-layout title="API Tokens">
    <template #header>
      <h2 class="text-xl font-semibold leading-tight text-grey-800">
        API Tokens
      </h2>
    </template>

    <div>
      <div class="mx-auto max-w-7xl py-10 sm:px-6 lg:px-8">
        <api-token-manager
          :tokens="tokens"
          :available-permissions="availablePermissions"
          :default-permissions="defaultPermissions"
        />
      </div>
    </div>
  </app-layout>
</template>

<script>
import { defineComponent } from "vue";
import ApiTokenManager from "@/Pages/API/Partials/ApiTokenManager.vue";
import AppLayout from "@/Layouts/AppLayout.vue";

export default defineComponent({
  props: ["tokens", "availablePermissions", "defaultPermissions"],

  components: {
    ApiTokenManager,
    AppLayout,
  },
});
</script>
