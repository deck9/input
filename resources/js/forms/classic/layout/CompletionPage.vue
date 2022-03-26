<template>
  <div>
    <h2 class="text-lg font-medium">
      {{ store.form?.eoc_headline || "Form Submitted" }}
    </h2>
    <p v-if="store.form?.eoc_text" class="mt-2 text-base leading-6">
      {{ store.form?.eoc_text }}
    </p>
    <pre class="mt-4 rounded bg-black px-4 py-4 text-xs text-green-600"
      >{{ JSON.stringify(store.payload) }} </pre
    >
    <CallToActionButton
      v-if="store.form?.cta_link"
      :href="store.form?.cta_link"
      :label="store.form?.cta_label ?? 'Close'"
    />
  </div>
</template>

<script lang="ts" setup>
import CallToActionButton from "./CallToActionButton.vue";
import { useConversation } from "@/stores/conversation";

const store = useConversation();
</script>
