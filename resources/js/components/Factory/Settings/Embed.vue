<template>
  <div>
    <div class="mb-4 grid grid-cols-3 gap-x-4">
      <EmbedTypeButton
        label="iFrame"
        :is-active="embedType === 'iframe'"
        @click="embedType = 'iframe'"
        icon="/images/embeds/iframe.svg"
      />
      <EmbedTypeButton
        label="Embed Link"
        :is-active="embedType === 'link'"
        @click="embedType = 'link'"
        icon="/images/embeds/link.svg"
      />
      <EmbedTypeButton
        label="Native (Experimental)"
        :is-active="embedType === 'native'"
        @click="embedType = 'native'"
        icon="/images/embeds/native.svg"
      />
    </div>

    <div class="mb-4">
      <Code class="w-full" :code="embedCode" />
    </div>

    <form>
      <h2 class="mb-4 text-base font-bold">Options</h2>

      <div
        v-if="embedType !== 'link'"
        class="mb-3 flex justify-between border-b border-grey-200 pb-3"
      >
        <D9Label label="Use full height" />
        <D9Switch
          label=""
          v-model="useFullheight"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <div
        v-if="!useFullheight && embedType !== 'link'"
        class="mb-3 border-b border-grey-200 pb-3"
      >
        <D9Label class="mb-1" label="Custom Height" /><br />
        <span class="relative inline-block">
          <D9Input v-model="height" />
          <span class="absolute inset-y-0 right-4 flex items-center">px</span>
        </span>
      </div>

      <div class="mb-3 flex justify-between border-b border-grey-200 pb-3">
        <D9Label label="Hide Title" />
        <D9Switch
          label="Hide Title"
          v-model="hideTitle"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <div class="mb-3 flex justify-between border-b border-grey-200 pb-3">
        <D9Label label="Hide Navigation" />
        <D9Switch
          label="Hide Navigation"
          v-model="hideNavigation"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <div class="mb-3 flex justify-between border-b border-grey-200 pb-3">
        <D9Label label="Autofocus on Load" />
        <D9Switch
          label="Autofocus on Load"
          v-model="focusOnMount"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <div class="mb-3 flex justify-between border-b border-grey-200 pb-3">
        <D9Label label="Align Left" />
        <D9Switch
          label="Align Left"
          v-model="alignLeft"
          onLabel="yes"
          offLabel="no"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { useForm } from "@/stores/form";
import { D9Label, D9Input, D9Switch } from "@deck9/ui";
import { computed, ref } from "vue";
import Code from "@/components/Code.vue";
import EmbedTypeButton from "@/components/Factory/Settings/partials/EmbedTypeButton.vue";

const store = useForm();

type EmbedType = "native" | "iframe" | "link";

const embedType = ref<EmbedType>("iframe");

const height = ref(520);
const useFullheight = ref(false);
const hideTitle = ref(false);
const hideNavigation = ref(false);
const focusOnMount = ref(false);
const alignLeft = ref(false);

const embedCode = computed(() => {
  const embedParams = new URLSearchParams(
    Object.fromEntries(
      [
        ["iframe", "1"],
        ["hideTitle", hideTitle.value ? "1" : undefined],
        ["hideNavigation", hideNavigation.value ? "1" : undefined],
        ["focusOnMount", focusOnMount.value ? "1" : "0"],
        ["alignLeft", alignLeft.value ? "1" : undefined],
      ].filter((item) => item[1])
    )
  ).toString();

  const embedUrl = new URL(
    `${window.location.origin}/${store.form?.uuid}${
      embedParams.length > 0 ? "?" + embedParams : ""
    }`
  );

  switch (embedType.value) {
    case "native":
      return `
<!-- Place this wherever you want to embed your form -->
<div id="${store.form?.uuid}-wrapper" class="ipt" style="height: ${
        useFullheight.value === true ? "100%" : height.value + "px"
      }; width: 100%;">
</div>

<!-- Place this before the closing body tag -->
<script src="${window.location.origin}/js/classic.js"
  data-form="${store.form?.uuid}"
  data-hide-title="${hideTitle.value}"
  data-autofocus="${focusOnMount.value}"
  data-alignleft="${alignLeft.value}"
  data-hide-navigation="${hideNavigation.value}" async><\/script>
      `.trim();

    case "iframe":
      return `
<!-- Place this wherever you want to embed your form -->
<iframe src="${embedUrl}"
  width="100%"
  height="${useFullheight.value === true ? "100%" : height.value + "px"}"
  frameborder="0"
  marginheight="0"
  marginwidth="0"></iframe>
      `.trim();

    case "link":
      return `${embedUrl}`.trim();

    default:
      return "-";
  }
});
</script>
