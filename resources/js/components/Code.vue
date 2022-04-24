<template>
  <div>
    <div
      class="overflow-hidden rounded border border-grey-800 font-mono text-xs"
    >
      <hightlightjs language="html" :code="code"></hightlightjs>
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
import "highlight.js/lib/common";
import hljsVuePlugin from "@highlightjs/vue-plugin";
import { D9Button } from "@deck9/ui";
import { useClipboard } from "@vueuse/core";
import { ref } from "vue";

const hightlightjs = hljsVuePlugin.component;

const props = defineProps<{
  code: string;
}>();

const { copy, copied, isSupported } = useClipboard();

const copyCode = () => {
  copy(props.code);
};
</script>
