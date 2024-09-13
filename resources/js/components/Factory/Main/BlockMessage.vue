<template>
  <div>
    <h2 class="mb-4 text-base font-bold">Message</h2>
    <div>
      <div
        class="mb-1 py-1 bg-white border border-grey-300 rounded-lg flex items-center divide-x divide-grey-400"
      >
        <div class="px-1">
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('bold') ?? false,
              icon: 'bold',
              label: 'Bold',
            }"
            @click="editor?.chain().focus().toggleBold().run()"
          />
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('italic') ?? false,
              icon: 'italic',
              label: 'Italic',
            }"
            @click="editor?.chain().focus().toggleItalic().run()"
          />
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('underline') ?? false,
              icon: 'underline',
              label: 'Underline',
            }"
            @click="editor?.chain().focus().toggleUnderline().run()"
          />
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('link') ?? false,
              icon: 'link',
              label: 'Link',
            }"
            @click="setLink()"
          />
        </div>
        <div class="px-1">
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('heading', { level: 1 }) ?? false,
              icon: 'heading',
              label: 'Heading 1',
              subLabel: '1',
            }"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          />
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('heading', { level: 2 }) ?? false,
              icon: 'heading',
              label: 'Heading 2',
              subLabel: '2',
            }"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          />
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('heading', { level: 3 }) ?? false,
              icon: 'heading',
              label: 'Heading 3',
              subLabel: '3',
            }"
            @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
          />
        </div>
        <div class="px-1">
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('bulletList') ?? false,
              icon: 'list-ul',
              label: 'Bullet List',
            }"
            @click="editor?.chain().focus().toggleBulletList().run()"
          />
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('orderedList') ?? false,
              icon: 'list-ol',
              label: 'Ordered List',
            }"
            @click="editor?.chain().focus().toggleOrderedList().run()"
          />
        </div>
        <div class="px-1">
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('code') ?? false,
              icon: 'code',
              label: 'Code',
            }"
            @click="editor?.chain().focus().toggleCode().run()"
          />
          <EditorButton
            v-bind="{
              isActive: editor?.isActive('blockquote') ?? false,
              icon: 'quote-right',
              label: 'Blockquote',
            }"
            @click="editor?.chain().focus().toggleBlockquote().run()"
          />
        </div>
        <div class="px-1">
          <EditorButton
            v-bind="{
              isActive: false,
              icon: 'remove-format',
              label: 'Remove Formatting',
            }"
            @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
          />
        </div>
      </div>
      <editor-content :editor="editor" />
      <div class="mt-1 text-xs text-grey-600">
        {{ chars }} chars, {{ words }} words
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

import EditorButton from "@/components/Factory/Shared/EditorButton.vue";
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
    FontFamily,
    Link.configure({
      openOnClick: false,
    }),
    Placeholder.configure({
      placeholder: "Type your message here...",
    }),
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    TextStyle,
    Underline,
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

<style>
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;

  @apply text-grey-400;
}
</style>
