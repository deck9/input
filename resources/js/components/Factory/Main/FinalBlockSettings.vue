<template>
  <div class="ml-12 max-w-xl px-4 py-4">
    <div class="my-16">
      <h2 class="mb-2 text-base font-bold">Outro</h2>

      <form class="rounded bg-white px-6 py-6" @submit.prevent="saveOutro">
        <div class="mb-4">
          <D9Label label="Headline" />
          <D9Input type="text" block v-model="outroHeadline" />
        </div>
        <div class="mb-4">
          <D9Label label="Message" />
          <D9Input type="text" block v-model="outroMessage" />
        </div>

        <D9Button
          type="submit"
          label="Save Outro"
          icon="save"
          icon-position="left"
          :isLoading="isSubmittingOutro"
        />
      </form>
    </div>

    <div class="my-16">
      <h2 class="mb-2 flex items-center text-base font-bold">
        <span class="inline-block">Call to Action</span>
        <D9Switch
          class="ml-2"
          label=""
          v-model="isCtaOn"
          @change="toggleCTA"
        ></D9Switch>
      </h2>

      <form
        class="rounded bg-white px-6 py-6 transition"
        :class="isCtaOn ? 'opacity-100' : 'pointer-events-none opacity-50'"
        @submit.prevent="saveCTA"
      >
        <div class="mb-4">
          <D9Label label="Label" />
          <D9Input type="text" block :disabled="!isCtaOn" v-model="ctaLabel" />
        </div>
        <div class="mb-4">
          <D9Label label="Link" />
          <D9Input type="url" block :disabled="!isCtaOn" v-model="ctaLink" />
        </div>

        <D9Button
          type="submit"
          label="Save CTA"
          :isLoading="isSubmittingCta"
          icon="save"
          icon-position="left"
        />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Label, D9Input, D9Button, D9Switch } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();

const isSubmittingCta = ref(false);
const isCtaOn = ref(store.form?.show_cta_link ? true : false);
const ctaLabel = ref(store.form?.cta_label);
const ctaLink = ref(store.form?.cta_link);

const isSubmittingOutro = ref(false);
const outroHeadline = ref(store.form?.eoc_headline);
const outroMessage = ref(store.form?.eoc_text);

const saveOutro = async () => {
  isSubmittingOutro.value = true;

  await store.updateForm({
    eoc_headline: outroHeadline.value,
    eoc_text: outroMessage.value,
  });

  setTimeout(() => (isSubmittingOutro.value = false), 400);
};

const toggleCTA = async () => {
  await store.updateForm({
    show_cta_link: isCtaOn.value,
  });
};

const saveCTA = async () => {
  isSubmittingCta.value = true;

  await store.updateForm({
    cta_label: ctaLabel.value,
    cta_link: ctaLink.value,
  });

  setTimeout(() => (isSubmittingCta.value = false), 400);
};
</script>
