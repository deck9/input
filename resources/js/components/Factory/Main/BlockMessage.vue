<template>
  <div>
    <h2 class="mb-4 text-base font-bold">Message</h2>
    <div>
      <div class="w-full rounded border-0">
        <div class="mb-1">
          <button
            :class="[
              'rounded px-2 py-1 text-sm',
              editor?.isActive('bold')
                ? 'text-grey-900 font-bold'
                : 'text-grey-500 hover:text-grey-800',
            ]"
            @click="editor?.chain().focus().toggleBold().run()"
          >
            <D9Icon name="bold" />
            Bold
          </button>
          <button
            :class="[
              'rounded px-2 py-1 text-sm',
              editor?.isActive('italic')
                ? 'text-grey-900 font-bold'
                : 'text-grey-500 hover:text-grey-800',
            ]"
            @click="editor?.chain().focus().toggleItalic().run()"
          >
            <D9Icon name="italic" />
            Italic
          </button>
          <button
            :class="[
              'rounded px-2 py-1 text-sm',
              editor?.isActive('link')
                ? 'text-grey-900 font-bold'
                : 'text-grey-500 hover:text-grey-800',
            ]"
            @click="setLink()"
          >
            <D9Icon name="link" />
            Link
          </button>
        </div>
        <editor-content :editor="editor" />
        <div class="text-grey-600 mt-1 text-xs">
          {{ chars }} chars, {{ words }} words
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { useWorkbench } from "@/stores";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { ref } from "vue";
import { useContentLength } from "@/utils/useContentLength";

const workbench = useWorkbench();

const content = ref(workbench.block?.message ?? "");
const { chars, words } = useContentLength(content);

const editor = useEditor({
  content: content.value,
  editorProps: {
    attributes: {
      class:
        "prose prose-sm sm:prose focus:outline-none border border-grey-300 bg-white text-grey-800 px-5 py-3 rounded-md",
    },
  },
  onUpdate: () => {
    if (!editor.value) return;
    content.value = editor.value.getText();

    workbench.updateBlock({
      message: chars.value > 0 ? editor.value.getHTML() : null,
    });
  },
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
    }),
  ],
});

const setLink = () => {
  if (typeof editor.value === "undefined") {
    return;
  }

  const previousUrl = editor.value.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();

    return;
  }

  // update link
  editor.value
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};
</script>
