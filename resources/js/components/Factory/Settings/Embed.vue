<template>
  <div>
    <div class="mb-4">
      <Code class="w-full" :code="embedCode" />
    </div>

    <form>
      <h2 class="mb-4 text-base font-bold">Options</h2>

      <div class="mb-3 flex justify-between border-b border-grey-200 pb-3">
        <D9Label label="Use full height" />
        <D9Switch
          label=""
          v-model="useFullheight"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <div v-if="!useFullheight" class="mb-3 border-b border-grey-200 pb-3">
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

const store = useForm();

const height = ref(520);
const useFullheight = ref(false);
const hideTitle = ref(false);
const hideNavigation = ref(false);
const focusOnMount = ref(false);
const alignLeft = ref(false);

const embedCode = computed(() => {
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
  data-hide-navigation="${hideNavigation.value}"><\/script>
  `.trim();
});
</script>
