<template>
  <div>
    <h3 class="font-bold">{{ t("Find us here") }}:</h3>
    <ul class="mt-1 flex space-x-3">
      <li v-for="provider in socialLinkProviders" :key="provider">
        <a
          v-if="store.form && store.form[provider]"
          class="flex items-center text-2xl text-content/70 transition duration-150 hover:text-primary"
          :href="store.form[provider]"
          ><D9Icon :name="provider" size="1x" />
          <span class="sr-only ml-1">{{ provider }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { useConversation } from "@/stores/conversation";
import { D9Icon } from "@deck9/ui";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const store = useConversation();
const socialLinkProviders = ref([
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "github",
]);
</script>
