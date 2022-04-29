<template>
  <div>
    <div
      class="overflow-hidden rounded border border-grey-800 font-mono text-xs"
    >
      <hightlightjs language="xml" :code="code"></hightlightjs>
    </div>
    <D9Button
      v-if="isSupported"
      class="mt-2"
      label="Copy Code"
      icon="clipboard"
      size="small"
      color="dark"
      @click="copyCode"
    />
    <span class="ml-3 text-sm text-green-500" v-if="copied">Copied!</span>
  </div>
</template>

<script setup lang="ts">
import "highlight.js/styles/atom-one-dark.css";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import hljsVuePlugin from "@highlightjs/vue-plugin";
import { D9Button } from "@deck9/ui";
import { useClipboard } from "@vueuse/core";

hljs.registerLanguage("javascript", xml);

const hightlightjs = hljsVuePlugin.component;

const props = defineProps<{
  code: string;
}>();

const { copy, copied, isSupported } = useClipboard();

const copyCode = () => {
  copy(props.code);
};
</script>
