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
      <h2 class="mb-2 flex items-center text-base font-bold">
        <span class="inline-block">CTA Link</span>
        <D9Switch class="ml-2" label="" v-model="isCtaOn"></D9Switch>
      </h2>

      <div
        class="origin-top transition-all duration-200"
        :class="
          isCtaOn
            ? 'opacity-100'
            : 'pointer-events-none scale-y-0 opacity-0 blur-sm'
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
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Label, D9Input, D9Switch } from "@deck9/ui";
import { onBeforeUnmount, ref, watch } from "vue";
import debounce from "lodash/debounce";

const store = useForm();

const outroHeadline = ref(store.form?.eoc_headline);
const outroMessage = ref(store.form?.eoc_text);

const isCtaOn = ref(store.form?.show_cta_link ? true : false);
const ctaLabel = ref(store.form?.cta_label);
const ctaLink = ref(store.form?.cta_link);

const saveCompletionPageSettings = debounce(async () => {
  await store.updateForm({
    eoc_headline: outroHeadline.value,
    eoc_text: outroMessage.value,
    show_cta_link: isCtaOn.value,
    cta_label: ctaLabel.value,
    cta_link: ctaLink.value,
  });
}, 400);

watch(
  [outroHeadline, outroMessage, isCtaOn, ctaLabel, ctaLink],
  saveCompletionPageSettings
);

onBeforeUnmount(async () => {
  await saveCompletionPageSettings.flush();
});
</script>
