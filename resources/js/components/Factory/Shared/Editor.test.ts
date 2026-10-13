import { mount, type VueWrapper } from "@vue/test-utils";
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

  it("saves an image-only text, and an emptied text as empty", async () => {
    const wrapper = mount(Editor, {
      props: { modelValue: stored },
      global: { directives: { tooltip: {} } },
    });
    await nextTick();
    const editor = wrapper
      .findComponent(EditorContent)
      .props("editor") as TiptapEditor;
    const image = '<img src="https://example.com/image.png">';

    editor.commands.setContent(image);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([image]);

    editor.commands.clearContent();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);
  });
});

describe("block text counter", () => {
  const open = async (modelValue?: string) => {
    const wrapper = mount(Editor, {
      props: { modelValue, counter: true },
      global: { directives: { tooltip: {} } },
    });
    // tiptap creates the editor a tick after mount
    await new Promise((resolve) => setTimeout(resolve));
    await nextTick();
    return wrapper;
  };
  const counter = (wrapper: VueWrapper) =>
    wrapper.element.lastElementChild?.textContent?.trim();

  it("counts a saved text the same before and after an edit", async () => {
    const wrapper = await open(stored);
    const opened = counter(wrapper);
    const editor = wrapper
      .findComponent(EditorContent)
      .props("editor") as TiptapEditor;

    editor.commands.insertContentAt(editor.state.doc.content.size, "<p>x</p>");
    editor.commands.undo();
    await nextTick();

    expect(opened).toMatch(/^\d+ chars, \d+ words$/);
    expect(opened).toBe(counter(wrapper));
  });

  it("counts an empty text as 0 chars, 0 words", async () => {
    expect(counter(await open())).toBe("0 chars, 0 words");
  });

  it.each([
    ["<h2>Hi</h2><p>there</p>", 2],
    ["<ul><li><p>one</p></li><li><p>two</p></li></ul>", 2],
    ["<p></p><p></p>", 0],
  ])("counts %s as %i words", async (html, words) => {
    expect(counter(await open(html))).toMatch(`, ${words} words`);
  });

  it("counts a text of only spaces as 0 words", async () => {
    const wrapper = await open();
    const editor = wrapper
      .findComponent(EditorContent)
      .props("editor") as TiptapEditor;

    editor.view.dispatch(editor.state.tr.insertText("   "));
    await nextTick();

    expect(counter(wrapper)).toBe("3 chars, 0 words");
  });
});

describe("a bare editor", () => {
  it("draws no box around its toolbar and text", async () => {
    const wrapper = mount(Editor, {
      props: { modelValue: "<p>Hi</p>", bare: true },
      global: { directives: { tooltip: {} } },
    });
    await nextTick();

    expect(wrapper.find("[role=group]").classes()).not.toContain("border");
    const editor = wrapper
      .findComponent(EditorContent)
      .props("editor") as TiptapEditor;
    expect(editor.view.dom.classList).not.toContain("border");
    expect(wrapper.text()).not.toContain("chars");
  });
});
