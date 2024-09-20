<template>
  <div>
    <div
      class="mb-1 py-1 bg-white border border-grey-300 rounded-lg flex flex-wrap gap-y-2 items-center"
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
        <EditorButton
          v-bind="{
            isActive: false,
            icon: 'image',
            label: 'Image',
          }"
          @click="setImage()"
        />
      </div>
      <div class="px-1">
        <EditorButton
          v-bind="{
            isActive: editor?.isActive('heading', { level: 2 }) ?? false,
            icon: 'heading',
            label: 'Heading 1',
            subLabel: '1',
          }"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        />
        <EditorButton
          v-bind="{
            isActive: editor?.isActive('heading', { level: 3 }) ?? false,
            icon: 'heading',
            label: 'Heading 2',
            subLabel: '2',
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
    <div v-if="counter" class="mt-1 text-xs text-grey-600">
      {{ chars }} chars, {{ words }} words
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import EditorButton from "@/components/Factory/Shared/EditorButton.vue";
import { useContentLength } from "@/utils/useContentLength";
import { ref } from "vue";

const { modelValue, counter = false } = defineProps<{
  modelValue?: string;
  counter?: boolean;
}>();

const content = ref(modelValue ?? "");

const { chars, words } = useContentLength(content);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const editor = useEditor({
  content: modelValue,
  editorProps: {
    attributes: {
      class:
        "form-message-prose conversation-theme focus:outline-none border border-grey-300 bg-white text-grey-800 px-5 py-3 rounded-md",
    },
  },
  onUpdate: () => {
    if (!editor.value) return;
    content.value = editor.value.getText();
    emit("update:modelValue", chars.value > 0 ? editor.value.getHTML() : "");
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
        levels: [2, 3],
      },
      dropcursor: {
        color: "#ff0000",
        width: 3,
      },
    }),
    TextStyle,
    Underline,
    Image,
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

const setImage = () => {
  if (typeof editor.value === "undefined") {
    return;
  }

  const previousUrl = editor.value.getAttributes("image").src;
  const url = window.prompt("URL", previousUrl);

  // cancelled
  if (url === null || url === "") {
    return;
  }

  if (!url.startsWith("https")) {
    window.alert("Please enter a valid secure URL");
    return;
  }

  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run();
  }
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
