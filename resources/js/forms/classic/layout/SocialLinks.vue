<template>
  <div>
    <h3 class="text-grey-600">{{ t("Find us here") }}</h3>
    <ul class="flex space-x-2">
      <li v-for="provider in socialLinkProviders" :key="provider">
        <a
          v-if="store.form && store.form[provider]"
          class="flex items-center text-lg text-grey-400 transition duration-150 hover:text-primary"
          :href="store.form[provider]"
          ><D9Icon :name="provider" />
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
