<template>
  <!-- the public form in preview mode: it saves no answers -->
  <iframe
    ref="frame"
    :key="loads"
    :src="src"
    title="Preview of your form"
    class="min-h-0 w-80 max-w-full flex-1 rounded-[28px] border border-grey-300 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.14)] sm:max-h-[600px]"
  ></iframe>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { useForm, useLogic, useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";
import type { PreviewMessage } from "@/forms/classic/usePreviewMessages";

// the question the preview shows, and an open one it didn't go to
const shown = defineModel<string | null>("shown", { default: null });
const missed = defineModel<string | null>("missed", { default: null });

const store = useForm();
const workbench = useWorkbench();
const origin = window.location.origin;
const frame = ref<HTMLIFrameElement | null>(null);

const url = () => {
  const query = new URLSearchParams({ preview: "1" });

  if (workbench.block) {
    query.set("block", workbench.block.uuid);
  }

  return `${window.route("forms.show", { uuid: store.form?.uuid }, false)}?${query}`;
};

const src = ref(url());
const loads = ref(0);
// the preview tells where it starts, then each question it moves on to
let started = false;
// the question the document opened because the preview showed it
let followed: string | null = null;

const send = (message: PreviewMessage) =>
  frame.value?.contentWindow?.postMessage(message, origin);

// a running preview moves at once; when it doesn't, a rule hides the question
let waiting: ReturnType<typeof setTimeout> | undefined;
const goto = (block: string) => {
  send({ type: "input:preview:goto", block });
  clearTimeout(waiting);
  missed.value = null;

  if (started && block !== shown.value) {
    waiting = setTimeout(() => (missed.value = block), 500);
  }
};
onBeforeUnmount(() => clearTimeout(waiting));

// a change reached the server: show it, at the open question
const reload = () => {
  src.value = url();
  loads.value++;
  started = false;
  clearTimeout(waiting);
};

// the server sends empty settings as [], a card saves them as {}
const content = () =>
  JSON.stringify(store.blocks, (_, value) =>
    Array.isArray(value) && !value.length ? {} : value,
  );
// typing saves a second later, so another save can come back and reload
// before the change is on the server; opening a card saves it unchanged,
// which must keep the preview and its answers: reload after each save that
// carries a change
const edits = { updateBlock: "saveBlock", updateInteraction: "saveInteraction" };
const changed = new Set<string>();
const sending = new Set<string>();
workbench.$onAction(({ name, args, after }) => {
  if (name === "updateBlock" || name === "updateInteraction") {
    const before = content();
    after(() => {
      if (content() !== before) changed.add(edits[name]);
    });
  } else if (
    (name === "saveBlock" || name === "saveInteraction") &&
    changed.delete(name)
  ) {
    sending.add(`${name}:${args[0].id}`);
  }
});
// every other save that works changes the form; rules save on their own;
// the store takes in the answer after it (a new question opens, a deleted
// one leaves), so wait a tick to reload at the open question
useNotice().$onAction(({ name, args, after }) => {
  if (name !== "clearSaveError") {
    return;
  }

  const [save] = args;
  if (sending.delete(save) || !/^save(Block|Interaction):/.test(save)) {
    after(() => nextTick(reload));
  }
});
useLogic().$onAction(({ name, after }) => {
  if (name === "saveBlockLogic") after(() => nextTick(reload));
});

watch(
  () => workbench.block?.uuid,
  (block) => {
    if (block && block !== followed) {
      goto(block);
    }
    followed = null;
  },
);

useEventListener(window, "message", async (event: MessageEvent) => {
  const data = event.data as PreviewMessage | undefined;

  if (
    event.origin !== origin ||
    !frame.value?.contentWindow ||
    event.source !== frame.value.contentWindow ||
    data?.type !== "input:preview:block" ||
    typeof data.block !== "string"
  ) {
    return;
  }

  shown.value = data.block;
  clearTimeout(waiting);
  missed.value = null;

  // where it starts isn't a move: the open block may be a group or a hidden question,
  // or the preview loaded after the owner opened another one
  if (!started) {
    started = true;
    if (workbench.block && workbench.block.uuid !== data.block) {
      goto(workbench.block.uuid);
    }
    return;
  }

  const block = store.blocks?.find((item) => item.uuid === data.block);

  if (!block || block.id === workbench.block?.id) {
    return;
  }

  followed = block.uuid;
  workbench.putOnWorkbench(block);
  await nextTick();
  document
    .getElementById(`row-${block.uuid}`)
    ?.scrollIntoView({ block: "nearest" });
});
</script>
