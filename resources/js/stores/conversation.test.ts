import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia, storeToRefs } from 'pinia';
import { effectScope, nextTick } from 'vue';
import { useConversation } from './conversation';
import * as logicHelpers from './helpers/logic';
import { callSubmitForm } from '@/api/conversation';
import handler from '@/api/handler';
import { useBeforeUnload } from '@/utils/useBeforeUnload';

// Mock the logic helpers
vi.mock('./helpers/logic', async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule as any,
    evaluateGotoLogic: vi.fn(),
    isBlockVisible: vi.fn().mockReturnValue(true)
  };
});

vi.mock('@/api/conversation', async (importOriginal) => ({
  ...(await importOriginal() as any),
  callSubmitForm: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/utils/useRoutes', () => ({
  useRoutes: async () => ({ route: () => '/upload' }),
}));

const makeBlocks = (...ids: string[]): PublicFormBlockModel[] =>
  ids.map((id) => ({
    id,
    message: null,
    title: null,
    type: 'input-short',
    parent_block: null,
    is_required: false,
    interactions: [],
    logics: undefined,
  }));

describe('Conversation Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('executeGotoAction', () => {
    it('should navigate to target block when found', () => {
      const store = useConversation();
      
      // Setup a processed queue with multiple blocks
      const blocks = makeBlocks('block1', 'block2', 'targetBlock');
      
      // Mock the processedQueue getter
      vi.spyOn(store, 'processedQueue', 'get').mockReturnValue(blocks);
      store.current = 'block1';
      
      const result = store.executeGotoAction('targetBlock');
      
      expect(result).toBe(true);
      expect(store.current).toBe('targetBlock');
    });
    
    it('should return false when target block not found', () => {
      const store = useConversation();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Setup a queue without the target block
      const blocks = makeBlocks('block1', 'block2');
      
      // Mock the processedQueue getter
      vi.spyOn(store, 'processedQueue', 'get').mockReturnValue(blocks);
      store.current = 'block1';
      
      const result = store.executeGotoAction('nonExistentBlock');
      
      expect(result).toBe(false);
      expect(store.current).toBe('block1'); // Should not change
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Target block nonExistentBlock not found')
      );
    });
  });
  
  describe('next', () => {
    it('should execute goto action when evaluateGotoLogic returns a target', async () => {
      const store = useConversation();
      
      // Mock blocks and current block; the target is not the next block
      const blocks = makeBlocks('block1', 'block2', 'targetBlock');

      // Setup store state
      vi.spyOn(store, 'processedQueue', 'get').mockReturnValue(blocks);
      vi.spyOn(store, 'currentBlock', 'get').mockReturnValue(blocks[0]);
      vi.spyOn(store, 'isLastBlock', 'get').mockReturnValue(false);
      store.current = 'block1';

      // Mock evaluation to return a goto target
      const evaluateGotoLogicMock = vi.mocked(logicHelpers.evaluateGotoLogic);
      evaluateGotoLogicMock.mockReturnValue({ target: 'targetBlock' });

      // Spy on executeGotoAction and goToIndex
      const executeGotoSpy = vi.spyOn(store, 'executeGotoAction');
      const goToIndexSpy = vi.spyOn(store, 'goToIndex');

      const result = await store.next();

      // Verify goto was executed
      expect(evaluateGotoLogicMock).toHaveBeenCalledWith(blocks[0], {});
      expect(executeGotoSpy).toHaveBeenCalledWith('targetBlock');

      // Verify normal navigation stopped after the goto
      expect(result).toBe(false);
      expect(goToIndexSpy).toHaveBeenCalledTimes(1);
      expect(goToIndexSpy).toHaveBeenCalledWith(2);
      expect(store.current).toBe('targetBlock');
    });
    
    it('should proceed normally when evaluateGotoLogic returns null', async () => {
      const store = useConversation();
      
      // Mock blocks and state
      const blocks = makeBlocks('block1', 'block2');
      
      vi.spyOn(store, 'processedQueue', 'get').mockReturnValue(blocks);
      vi.spyOn(store, 'currentBlock', 'get').mockReturnValue(blocks[0]);
      vi.spyOn(store, 'isLastBlock', 'get').mockReturnValue(false);
      store.current = 'block1';
      
      // Mock goToIndex to track it was called
      const goToIndexSpy = vi.spyOn(store, 'goToIndex');
      
      // Mock evaluation to return null (no goto)
      const evaluateGotoLogicMock = vi.mocked(logicHelpers.evaluateGotoLogic);
      evaluateGotoLogicMock.mockReturnValue(null);
      
      await store.next();
      
      // Should not call executeGotoAction
      expect(evaluateGotoLogicMock).toHaveBeenCalledWith(blocks[0], {});
      expect(goToIndexSpy).toHaveBeenCalledWith(1); // Should go to next block index
    });
    
    it('should fallback to normal navigation when goto target is not found', async () => {
      const store = useConversation();
      
      // Mock blocks and state
      const blocks = makeBlocks('block1', 'block2');
      
      vi.spyOn(store, 'processedQueue', 'get').mockReturnValue(blocks);
      vi.spyOn(store, 'currentBlock', 'get').mockReturnValue(blocks[0]);
      vi.spyOn(store, 'isLastBlock', 'get').mockReturnValue(false);
      store.current = 'block1';
      
      // Mock goToIndex to track it was called
      const goToIndexSpy = vi.spyOn(store, 'goToIndex');
      
      // Mock executeGotoAction to return false (target not found)
      const executeGotoSpy = vi.spyOn(store, 'executeGotoAction').mockReturnValue(false);
      
      // Mock evaluation to return a non-existent target
      const evaluateGotoLogicMock = vi.mocked(logicHelpers.evaluateGotoLogic);
      evaluateGotoLogicMock.mockReturnValue({ target: 'nonExistentBlock' });
      
      await store.next();
      
      // Should try to execute goto but fall back to normal navigation
      expect(evaluateGotoLogicMock).toHaveBeenCalledWith(blocks[0], {});
      expect(executeGotoSpy).toHaveBeenCalledWith('nonExistentBlock');
      expect(goToIndexSpy).toHaveBeenCalledWith(1); // Should proceed to next block
    });
  });

  describe('redirect after submit', () => {
    const submitWithRedirectTo = async (cta_link: string) => {
      const store = useConversation();
      const blocks = makeBlocks('block1');

      vi.spyOn(store, 'currentBlock', 'get').mockReturnValue(blocks[0]);
      vi.spyOn(store, 'isLastBlock', 'get').mockReturnValue(true);
      vi.mocked(logicHelpers.evaluateGotoLogic).mockReturnValue(null);
      store.form = { uuid: 'form', use_cta_redirect: true, cta_link } as PublicFormModel;
      store.session = { token: 'session' } as FormSessionModel;

      await store.next();

      return store;
    };

    it.each(['javascript:void(0)', 'mailto:team@example.com'])(
      'skips a stored link that is not http(s): %s',
      async (link) => {
        const navigation = vi.spyOn(console, 'error').mockImplementation(() => {});
        const store = await submitWithRedirectTo(link);

        // no redirect, so the form shows its end page
        expect(store.isSubmitted).toBe(true);
        expect(navigation).not.toHaveBeenCalled();
        navigation.mockRestore();
      },
    );

    it('turns the "Leave site?" prompt off before it redirects', async () => {
      const store = useConversation();
      const scope = effectScope();
      scope.run(() => useBeforeUnload(storeToRefs(store).hasUnsavedPayload));

      store.payload = { block1: { payload: 'yes', actionId: '1' } };
      await nextTick();

      const removeListener = vi.spyOn(window, 'removeEventListener');
      let promptOffAtRedirect = false;

      // jsdom can't navigate and reports the attempt as an error
      const navigation = vi.spyOn(console, 'error').mockImplementation(() => {
        promptOffAtRedirect = removeListener.mock.calls.some(([type]) => type === 'beforeunload');
      });

      await submitWithRedirectTo('https://example.com/thanks');

      expect(navigation).toHaveBeenCalled();
      expect(promptOffAtRedirect).toBe(true);
      navigation.mockRestore();
      removeListener.mockRestore();
      scope.stop();
    });
  });

  describe('callToActionUrl', () => {
    it('keeps the query string of the link and adds the session id', () => {
      const store = useConversation();
      store.form = {
        cta_link: 'https://example.com/thanks?ref=mail#top',
        cta_append_session_id: true,
      } as PublicFormModel;
      store.session = { token: 'session' } as FormSessionModel;

      expect(store.callToActionUrl).toBe(
        'https://example.com/thanks?ref=mail&ipt_session=session#top',
      );
    });
  });

  describe('submit on the last block', () => {
    const setupLastBlock = () => {
      const store = useConversation();

      vi.spyOn(store, 'currentBlock', 'get').mockReturnValue(makeBlocks('block1')[0]);
      vi.spyOn(store, 'isLastBlock', 'get').mockReturnValue(true);
      vi.mocked(logicHelpers.evaluateGotoLogic).mockReturnValue(null);
      store.form = { uuid: 'form' } as PublicFormModel;
      store.session = { token: 'session' } as FormSessionModel;

      return store;
    };

    it('stops the spinner when the submit fails and lets the user retry', async () => {
      const store = setupLastBlock();
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(callSubmitForm).mockRejectedValueOnce(new Error('Network Error'));

      await store.next();

      expect(store.isProcessing).toBe(false);
      expect(store.submitFailed).toBe(true);
      expect(store.isSubmitted).toBe(false);

      await store.next();

      expect(store.submitFailed).toBe(false);
      expect(store.isSubmitted).toBe(true);
    });

    it('sends nothing on a second press while the submit runs', async () => {
      const store = setupLastBlock();
      let finishSubmit = () => {};
      vi.mocked(callSubmitForm).mockReturnValueOnce(
        new Promise((resolve) => {
          finishSubmit = () => resolve({} as any);
        }),
      );

      const firstPress = store.next();
      await store.next();
      finishSubmit();
      await firstPress;

      expect(callSubmitForm).toHaveBeenCalledTimes(1);
      expect(store.isSubmitted).toBe(true);
    });

    describe('retry with files', () => {
      const [fileA, fileB] = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')];
      const uploadedNames = (upload) =>
        upload.mock.calls.map(([, formData]) => (formData.get('file') as File).name);

      const setupWithFiles = () => {
        const store = setupLastBlock();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        store.payload = { block1: { payload: [fileA, fileB], actionId: 'files' } };

        return store;
      };

      it('uploads each file once when the last call fails', async () => {
        const store = setupWithFiles();
        const upload = vi.spyOn(handler, 'post').mockResolvedValue({});
        vi.mocked(callSubmitForm)
          .mockResolvedValueOnce({} as any)
          .mockRejectedValueOnce(new Error('Network Error'));

        await store.next();
        await store.next();

        expect(store.isSubmitted).toBe(true);
        expect(uploadedNames(upload)).toEqual(['a.txt', 'b.txt']);
      });

      it('uploads only the failed file again', async () => {
        const store = setupWithFiles();
        const upload = vi
          .spyOn(handler, 'post')
          .mockResolvedValueOnce({})
          .mockRejectedValueOnce(new Error('Network Error'))
          .mockResolvedValue({});

        await store.next();
        await store.next();

        expect(store.isSubmitted).toBe(true);
        expect(uploadedNames(upload)).toEqual(['a.txt', 'b.txt', 'b.txt']);
      });

      it('keeps the spinner until every upload has finished', async () => {
        const store = setupWithFiles();
        let finishUpload = () => {};
        vi.spyOn(handler, 'post')
          .mockRejectedValueOnce(new Error('Network Error'))
          .mockReturnValueOnce(
            new Promise((resolve) => {
              finishUpload = () => resolve({});
            }),
          );

        const submit = store.next();
        await new Promise((resolve) => setTimeout(resolve));

        expect(store.isProcessing).toBe(true);

        finishUpload();
        await submit;

        expect(store.isProcessing).toBe(false);
        expect(store.submitFailed).toBe(true);
      });
    });
  });
});