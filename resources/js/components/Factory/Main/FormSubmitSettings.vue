<template>
  <form class="relative mx-12 max-w-xl space-y-16 px-4 pt-8 xl:mx-24">
    <div>
      <h2 class="mb-2 text-base font-bold">General</h2>

      <div>
        <div class="mb-4">
          <D9Label label="Headline" />
          <D9Input type="text" block v-model="outroHeadline" />
        </div>
        <div class="mb-4">
          <D9Label label="Message" />
          <D9Input type="text" block v-model="outroMessage" />
        </div>
      </div>
    </div>

    <div>
      <h2 class="mb-2 text-base font-bold">Integrations / Data Transmission</h2>

      <div>
        <div class="mb-4">
          <D9Label label="Integration" />
          <D9Select
            block
            :options="integrationTypes"
            disabledBadge="Planned"
            v-model="integrationMethod"
          />
        </div>
        <div class="mb-4">
          <D9Label label="Submit Method" />
          <D9Select block :options="submitTypes" v-model="submitMethod" />
        </div>
        <div class="mb-4">
          <D9Label label="Webhook / Submit URL" />
          <D9Input
            icon="external-link"
            type="url"
            block
            v-model="submitWebhook"
          />
        </div>
      </div>
    </div>

    <div>
      <h2 class="mb-2 flex items-center text-base font-bold">
        <span class="inline-block">CTA Link</span>
        <D9Switch class="ml-2" label="" v-model="isCtaOn"></D9Switch>
      </h2>

      <div
        class="origin-top transition-all duration-200"
        :class="
          isCtaOn
            ? 'opacity-100'
            : 'pointer-events-none h-0 scale-y-0 opacity-0 blur-sm'
        "
      >
        <div class="mb-4">
          <D9Label label="Label" />
          <D9Input type="text" block :disabled="!isCtaOn" v-model="ctaLabel" />
        </div>
        <div class="mb-4">
          <D9Label label="Link" />
          <D9Input type="url" block :disabled="!isCtaOn" v-model="ctaLink" />
        </div>
        <div class="mb-4 flex justify-between">
          <D9Label label="Append Incoming Query Parameters" />
          <D9Switch
            label="Append Incoming Query Parameters"
            v-model="ctaAppendParams"
            onLabel="yes"
            offLabel="no"
          />
        </div>
      </div>
    </div>

    <div>
      <h2 class="mb-2 flex items-center text-base font-bold">
        <span class="inline-block">Social Links</span>
        <D9Switch
          class="ml-2"
          label="Social Links"
          v-model="isSocialOn"
        ></D9Switch>
      </h2>

      <div
        class="origin-top transition-all duration-200"
        :class="
          isSocialOn
            ? 'opacity-100'
            : 'pointer-events-none h-0 scale-y-0 opacity-0 blur-sm'
        "
      >
        <div class="mb-4">
          <D9Label label="Instagram" />
          <D9Input
            type="url"
            block
            :disabled="!isSocialOn"
            v-model="instagram"
          />
        </div>
        <div class="mb-4">
          <D9Label label="Facebook" />
          <D9Input
            type="url"
            block
            :disabled="!isSocialOn"
            v-model="facebook"
          />
        </div>
        <div class="mb-4">
          <D9Label label="Twitter" />
          <D9Input type="url" block :disabled="!isSocialOn" v-model="twitter" />
        </div>
        <div class="mb-4">
          <D9Label label="LinkedIn" />
          <D9Input
            type="url"
            block
            :disabled="!isSocialOn"
            v-model="linkedin"
          />
        </div>
        <div class="mb-4">
          <D9Label label="Github" />
          <D9Input type="url" block :disabled="!isSocialOn" v-model="github" />
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Label, D9Input, D9Select, D9Switch } from "@deck9/ui";
import { onBeforeUnmount, ref, watch } from "vue";
import debounce from "lodash/debounce";

const store = useForm();

const outroHeadline = ref(store.form?.eoc_headline);
const outroMessage = ref(store.form?.eoc_text);

const integrationTypes = ref([
  { label: "Webhook", value: "webhook" },
  { label: "Make", value: "make", disabled: true },
  { label: "Zapier", value: "zapier", disabled: true },
]);

const integrationMethod = ref(integrationTypes.value[0]);

const submitTypes = ref([
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
]);

const submitMethod = ref(
  store.form?.submit_method
    ? submitTypes.value.find((i) => i.value === store.form?.submit_method)
    : submitTypes.value[0]
);
const submitWebhook = ref(store.form?.submit_webhook);

const isCtaOn = ref(store.form?.show_cta_link ? true : false);
const ctaLabel = ref(store.form?.cta_label);
const ctaLink = ref(store.form?.cta_link);
const ctaAppendParams = ref(store.form?.cta_append_params);

const isSocialOn = ref(store.form?.show_social_links ? true : false);
const instagram = ref(store?.form?.instagram);
const github = ref(store?.form?.github);
const linkedin = ref(store?.form?.linkedin);
const facebook = ref(store?.form?.facebook);
const twitter = ref(store?.form?.twitter);

const saveFormSubmitSettings = debounce(async () => {
  await store.updateForm({
    eoc_headline: outroHeadline.value,
    eoc_text: outroMessage.value,

    show_cta_link: isCtaOn.value,
    cta_label: ctaLabel.value,
    cta_link: ctaLink.value,
    cta_append_params: ctaAppendParams.value,

    show_social_links: isSocialOn.value,
    instagram: instagram.value,
    github: github.value,
    linkedin: linkedin.value,
    facebook: facebook.value,
    twitter: twitter.value,

    submit_method: submitMethod.value?.value,
    submit_webhook: submitWebhook.value,
  });
}, 400);

watch(
  [
    outroHeadline,
    outroMessage,
    isCtaOn,
    ctaLabel,
    ctaLink,
    ctaAppendParams,
    submitMethod,
    submitWebhook,
    isSocialOn,
    instagram,
    github,
    linkedin,
    facebook,
    twitter,
  ],
  saveFormSubmitSettings
);

onBeforeUnmount(async () => {
  await saveFormSubmitSettings.flush();
});
</script>
