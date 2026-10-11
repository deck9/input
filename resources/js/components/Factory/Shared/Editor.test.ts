import { mount } from "@vue/test-utils";
import { EditorContent, type Editor as TiptapEditor } from "@tiptap/vue-3";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import Editor from "./Editor.vue";

// HTML as the tiptap 2 editor saved it for block texts and completion pages
const stored =
  '<h2>Welcome</h2><h3>Before you start</h3><p>Some <strong>bold</strong>, <em>italic</em> and <u>underlined</u> text with <code>inline code</code> and a <a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">link</a>.</p><p>Line one<br>Line two</p><p>Above</p><p></p><p>Below</p><ul><li><p>First</p></li><li><p>Second</p></li></ul><ol><li><p>One</p></li><li><p>Two</p></li></ol><blockquote><p>A quote</p></blockquote><p><span style="font-family: Georgia;">Pasted font</span></p><img src="https://example.com/image.png">';

describe("block text editor", () => {
  it("loads stored HTML without saving and saves it unchanged", async () => {
    const wrapper = mount(Editor, {
      props: { modelValue: stored },
      global: { directives: { tooltip: {} } },
    });
    await nextTick();
    const editor = wrapper
      .findComponent(EditorContent)
      .props("editor") as TiptapEditor;

    expect(editor.getHTML()).toBe(stored);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    editor.commands.insertContentAt(editor.state.doc.content.size, "<p>x</p>");
    editor.commands.undo();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([stored]);
  });
});
