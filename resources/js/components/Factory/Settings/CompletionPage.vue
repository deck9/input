<template>
  <form @submit.prevent="saveFormSubmitSettings">
    <CompletionPageType v-model="useCtaRedirect" />

    <template v-if="useCtaRedirect">
      <div class="mt-8">
        <h2 class="mb-2 flex items-center text-base font-bold">
          <span class="inline-block">Redirect Settings</span>
        </h2>
        <div class="mb-4">
          <D9Label id="cta-link" label="Link" />
          <D9Input id="cta-link" type="url" block v-model="ctaLink" />
        </div>
        <div class="mb-4 flex justify-between">
          <D9Label
            id="cta-append-params"
            label="Append Incoming Query Parameters"
          />
          <D9Switch
            id="cta-append-params"
            label="Append Incoming Query Parameters"
            v-model="ctaAppendParams"
            onLabel="yes"
            offLabel="no"
          />
        </div>
        <div class="mb-4 flex justify-between">
          <D9Label
            id="cta-append-session-id"
            label="Append Session ID as Query Parameter"
          />
          <D9Switch
            id="cta-append-session-id"
            label="Append Session ID as Query Parameter"
            v-model="ctaAppendSessionId"
            onLabel="yes"
            offLabel="no"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="mt-8">
        <h2 class="mb-2 text-base font-bold">General</h2>

        <div>
          <div class="mb-4">
            <D9Label id="eoc-headline" label="Headline" />
            <D9Input
              id="eoc-headline"
              type="text"
              block
              v-model="outroHeadline"
            />
          </div>
          <div class="mb-4">
            <D9Label
              id="eoc-message"
              label="Message"
              @click="messageEditor?.focus()"
            />
            <Editor
              ref="messageEditor"
              id="eoc-message"
              class=""
              v-model="outroMessage"
            />
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="mb-2 flex items-center text-base font-bold">
          <label for="cta-enabled" class="inline-block">Call to Action</label>
          <D9Switch
            id="cta-enabled"
            class="ml-2"
            label="Activate Call to Action"
            v-model="isCtaOn"
          ></D9Switch>
        </h2>

        <div
          class="origin-top"
          :class="
            isCtaOn
              ? 'opacity-100'
              : 'pointer-events-none h-0 scale-y-0 opacity-0 blur-sm'
          "
        >
          <div class="mb-4">
            <D9Label id="cta-label" label="Label" />
            <D9Input id="cta-label" type="text" block v-model="ctaLabel" />
          </div>
          <div class="mb-4">
            <D9Label id="cta-link" label="Link" />
            <D9Input id="cta-link" type="url" block v-model="ctaLink" />
          </div>
          <div class="mb-4 flex justify-between">
            <D9Label
              id="cta-append-params"
              label="Append Incoming Query Parameters"
            />
            <D9Switch
              id="cta-append-params"
              label="Append Incoming Query Parameters"
              v-model="ctaAppendParams"
              onLabel="yes"
              offLabel="no"
            />
          </div>
          <div class="mb-4 flex justify-between">
            <D9Label
              id="cta-append-session-id"
              label="Append Session ID as Query Parameter"
            />
            <D9Switch
              id="cta-append-session-id"
              label="Append Session ID as Query Parameter"
              v-model="ctaAppendSessionId"
              onLabel="yes"
              offLabel="no"
            />
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="mb-2 flex items-center text-base font-bold">
          <label for="social-enabled" class="inline-block">Social Links</label>
          <D9Switch
            id="social-enabled"
            class="ml-2"
            label="Social Links"
            v-model="isSocialOn"
          ></D9Switch>
        </h2>

        <div
          class="origin-top"
          :class="
            isSocialOn
              ? 'opacity-100'
              : 'pointer-events-none h-0 scale-y-0 opacity-0 blur-sm'
          "
        >
          <div class="mb-4">
            <D9Label id="social-instagram" label="Instagram" />
            <D9Input
              id="social-instagram"
              type="url"
              block
              v-model="instagram"
            />
          </div>
          <div class="mb-4">
            <D9Label id="social-facebook" label="Facebook" />
            <D9Input id="social-facebook" type="url" block v-model="facebook" />
          </div>
          <div class="mb-4">
            <D9Label id="social-twitter" label="Twitter" />
            <D9Input id="social-twitter" type="url" block v-model="twitter" />
          </div>
          <div class="mb-4">
            <D9Label id="social-linkedin" label="LinkedIn" />
            <D9Input id="social-linkedin" type="url" block v-model="linkedin" />
          </div>
          <div class="mb-4">
            <D9Label id="social-github" label="Github" />
            <D9Input id="social-github" type="url" block v-model="github" />
          </div>
        </div>
      </div>
    </template>

    <ValidationErrors class="mt-8" v-if="errors.length > 0" :errors="errors" />

    <D9Button
      class="mt-8"
      type="submit"
      label="Save end screen"
      :is-loading="isSaving"
    />
  </form>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Label, D9Input, D9Switch, D9Button } from "@deck9/ui";
import { ref } from "vue";
import CompletionPageType from "@/components/Factory/Settings/partials/CompletionPageType.vue";
import Editor from "@/components/Factory/Shared/Editor.vue";
import ValidationErrors from "@/components/ValidationErrors.vue";
import { AxiosError } from "axios";

const store = useForm();
const isSaving = ref(false);
const errors = ref<string[]>([]);

const outroHeadline = ref(store.form?.eoc_headline ?? "");
const outroMessage = ref(store.form?.eoc_text ?? "");
const messageEditor = ref<InstanceType<typeof Editor> | null>(null);

const isCtaOn = ref(store.form?.show_cta_link ? true : false);
const ctaLabel = ref(store.form?.cta_label);
const ctaLink = ref(store.form?.cta_link);
const useCtaRedirect = ref(store.form?.use_cta_redirect);
const ctaAppendParams = ref(store.form?.cta_append_params);
const ctaAppendSessionId = ref(store.form?.cta_append_session_id);

const isSocialOn = ref(store.form?.show_social_links ? true : false);
const instagram = ref(store?.form?.instagram);
const github = ref(store?.form?.github);
const linkedin = ref(store?.form?.linkedin);
const facebook = ref(store?.form?.facebook);
const twitter = ref(store?.form?.twitter);

const saveFormSubmitSettings = async () => {
  isSaving.value = true;
  errors.value = [];
  try {
    await store.updateForm({
      eoc_headline: outroHeadline.value,
      eoc_text: outroMessage.value,

      show_cta_link: isCtaOn.value,
      cta_label: ctaLabel.value,
      cta_link: ctaLink.value,
      use_cta_redirect: useCtaRedirect.value,
      cta_append_params: ctaAppendParams.value,
      cta_append_session_id: ctaAppendSessionId.value,

      show_social_links: isSocialOn.value,
      instagram: instagram.value,
      github: github.value,
      linkedin: linkedin.value,
      facebook: facebook.value,
      twitter: twitter.value,
    });
  } catch (e) {
    if (e instanceof AxiosError) {
      errors.value = [e.response?.data?.message || "Unknown error"];
    } else {
      console.error(e);
    }
  } finally {
    isSaving.value = false;
  }
};
</script>
