/// <reference types="vitest/jsdom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { effectScope, nextTick } from 'vue';
import { useConversation } from '@/stores/conversation';
import { usePreviewMessages } from './usePreviewMessages';

const block = (id: string) => ({ id, type: 'input-short', parent_block: null, interactions: [] }) as unknown as PublicFormBlockModel;

// jsdom has no frames: the window is its own parent, so it stands in for the editor
const fromEditor = (data: unknown, init: MessageEventInit = {}) =>
  window.dispatchEvent(new MessageEvent('message', { data, origin: window.location.origin, source: window, ...init }));

describe('usePreviewMessages', () => {
  let scope: ReturnType<typeof effectScope>;
  let store: ReturnType<typeof useConversation>;
  let postMessage: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversation();
    store.queue = [block('q1'), block('q2'), block('q3')];
    store.current = 'q1';
    postMessage = vi.spyOn(window, 'postMessage').mockImplementation(() => {});

    scope = effectScope();
    scope.run(() => usePreviewMessages());
  });

  afterEach(() => {
    scope.stop();
    postMessage.mockRestore();
  });

  it('tells the editor which question shows, only on its own origin', async () => {
    expect(postMessage).toHaveBeenLastCalledWith({ type: 'input:preview:block', block: 'q1' }, window.location.origin);

    store.current = 'q2';
    await nextTick();

    expect(postMessage).toHaveBeenLastCalledWith({ type: 'input:preview:block', block: 'q2' }, window.location.origin);
  });

  it('goes to the question the editor asks for', () => {
    fromEditor({ type: 'input:preview:goto', block: 'q3' });

    expect(store.current).toBe('q3');
  });

  it.each([
    ['a message from another origin', { type: 'input:preview:goto', block: 'q3' }, { origin: 'https://evil.example' }],
    ['a message from another window', { type: 'input:preview:goto', block: 'q3' }, { source: null }],
    ['another message type', { type: 'other', block: 'q3' }, {}],
    ['a block that is not a string', { type: 'input:preview:goto', block: ['q3'] }, {}],
  ])('ignores %s', (_, data, init) => {
    fromEditor(data, init);

    expect(store.current).toBe('q1');
  });
});
