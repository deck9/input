import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia, storeToRefs } from 'pinia';
import { effectScope, nextTick } from 'vue';
import { useConversation } from './conversation';
import * as logicHelpers from './helpers/logic';
import { createFlatQueue } from './helpers/queue';
import { callGetFormStoryboard, callSubmitForm } from '@/api/conversation';
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
  callCreateFormSession: vi.fn().mockResolvedValue({ data: {} }),
  callGetFormStoryboard: vi.fn(),
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

const rule = (action: 'show' | 'hide', value: string, source = 'q0'): FormBlockLogic[] => [{
  form_block_id: 1,
  name: 'Rule',
  action,
  evaluate: 'before',
  action_payload: null,
  conditions: [{ source, operator: 'equals', value, chainOperator: 'and' }],
}];

const jump = (source: string, value: string, target: string): FormBlockLogic[] => [{
  form_block_id: 1,
  name: 'Jump',
  action: 'goto',
  evaluate: 'after',
  action_payload: target,
  conditions: [{ source, operator: 'equals', value, chainOperator: 'and' }],
}];

const sentAnswers = () => vi.mocked(callSubmitForm).mock.calls[0][2] as FormSubmitPayload;

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

  describe('show/hide rules on a group', () => {
    // q0, then a group with q1 and q2, then q3; q2 hides itself when q0 is "no"
    const visibleBlocks = (answer: string, groupRule = rule('hide', 'yes')) => {
      const store = useConversation();
      const [q0, group, q1, q2, q3] = makeBlocks('q0', 'group', 'q1', 'q2', 'q3');
      group.type = 'group';
      group.logics = groupRule;
      q1.parent_block = q2.parent_block = 'group';
      q2.logics = rule('hide', 'no');

      store.queue = createFlatQueue([q0, group, q1, q2, q3]);
      store.payload = { q0: { payload: answer, actionId: '1' } };
      store.path = ['q0'];

      return store.processedQueue.map((block) => block.id);
    };

    beforeEach(async () => {
      const { isBlockVisible } = await vi.importActual<typeof logicHelpers>('./helpers/logic');
      vi.mocked(logicHelpers.isBlockVisible).mockImplementation(isBlockVisible);
    });

    afterEach(() => {
      vi.mocked(logicHelpers.isBlockVisible).mockReturnValue(true);
    });

    it('hides every question in the group when a hide rule on the group fires', () => {
      expect(visibleBlocks('yes')).toEqual(['q0', 'q3']);
    });

    it('hides every question in the group when a show rule on the group does not match', () => {
      expect(visibleBlocks('no', rule('show', 'yes'))).toEqual(['q0', 'q3']);
    });

    it('keeps the rule on a single question inside a shown group', () => {
      expect(visibleBlocks('no')).toEqual(['q0', 'q1', 'q3']);
    });
  });

  describe('prefill from URL params', () => {
    beforeEach(async () => {
      const { isBlockVisible } = await vi.importActual<typeof logicHelpers>('./helpers/logic');
      vi.mocked(logicHelpers.isBlockVisible).mockImplementation(isBlockVisible);
    });

    afterEach(() => {
      vi.mocked(logicHelpers.isBlockVisible).mockReturnValue(true);
    });

    it('fills the question on load, keeps it shown and lets its answer fire a hide rule', async () => {
      const store = useConversation();
      const [email, company, q3] = makeBlocks('email', 'company', 'q3');
      email.title = 'email';
      email.interactions = [{ id: 'email-action' } as PublicFormBlockInteractionModel];
      // "company" hides when the email is from b.de
      company.logics = [{
        form_block_id: 1,
        name: 'Rule',
        action: 'hide',
        evaluate: 'before',
        action_payload: null,
        conditions: [{ source: 'email', operator: 'contains', value: '@b.de', chainOperator: 'and' }],
      }];
      vi.mocked(callGetFormStoryboard).mockResolvedValue({ data: { blocks: [email, company, q3] } } as any);

      await store.initForm({ uuid: 'form' } as PublicFormModel, { email: 'a@b.de' });

      expect(store.payload).toEqual({ email: { payload: 'a@b.de', actionId: 'email-action' } });
      expect(store.current).toBe('email');
      expect(store.processedQueue.map((block) => block.id)).toEqual(['email', 'q3']);
    });
  });

  describe('answers of hidden questions at submit', () => {
    beforeEach(async () => {
      const { isBlockVisible } = await vi.importActual<typeof logicHelpers>('./helpers/logic');
      vi.mocked(logicHelpers.isBlockVisible).mockImplementation(isBlockVisible);
      vi.mocked(logicHelpers.evaluateGotoLogic).mockReturnValue(null);
    });

    afterEach(() => {
      vi.mocked(logicHelpers.isBlockVisible).mockReturnValue(true);
    });

    const answers = (q0: string): FormSubmitPayload => ({
      q0: { payload: q0, actionId: 'a0' },
      q1: { payload: 'one', actionId: 'a1' },
      q2: { payload: 'two', actionId: 'a2' },
      q3: { payload: 'three', actionId: 'a3' },
    });

    // q1 hides when q0 is "a", the group with q2 hides when q0 is "b"; q3 is the last question
    const setupForm = (payload: FormSubmitPayload) => {
      const store = useConversation();
      const [q0, q1, group, q2, q3] = makeBlocks('q0', 'q1', 'group', 'q2', 'q3');
      q1.logics = rule('hide', 'a');
      group.type = 'group';
      group.logics = rule('hide', 'b');
      q2.parent_block = 'group';

      store.queue = createFlatQueue([q0, q1, group, q2, q3]);
      store.payload = payload;
      // the respondent went through every question
      store.path = ['q0', 'q1', 'q2'];
      store.current = 'q3';
      store.form = { uuid: 'form' } as PublicFormModel;
      store.session = { token: 'session' } as FormSessionModel;

      return store;
    };

    it('leaves out the answer of a question a rule hides', async () => {
      await setupForm(answers('a')).next();

      expect(Object.keys(sentAnswers())).toEqual(['q0', 'q2', 'q3']);
    });

    it('leaves out the answer of a question in a hidden group', async () => {
      await setupForm(answers('b')).next();

      expect(Object.keys(sentAnswers())).toEqual(['q0', 'q1', 'q3']);
    });

    it('keeps the answer while hidden and sends it once the question shows again', async () => {
      const store = setupForm(answers('a'));

      expect(store.submittablePayload).not.toHaveProperty('q1');

      store.payload.q0 = { payload: 'c', actionId: 'a0' };
      await store.next();

      expect(sentAnswers().q1).toEqual({ payload: 'one', actionId: 'a1' });
    });

    it('leaves out a prefilled answer of a question a rule hides', async () => {
      const store = useConversation();
      const [q0, company] = makeBlocks('q0', 'company');
      q0.title = 'q0';
      q0.interactions = [{ id: 'a0' } as PublicFormBlockInteractionModel];
      company.title = 'company';
      company.interactions = [{ id: 'company-action' } as PublicFormBlockInteractionModel];
      company.logics = rule('hide', 'a');
      vi.mocked(callGetFormStoryboard).mockResolvedValue({ data: { blocks: [q0, company] } } as any);

      await store.initForm({ uuid: 'form' } as PublicFormModel, { q0: 'a', company: 'ACME' });
      store.session = { token: 'session' } as FormSessionModel;
      await store.next();

      expect(sentAnswers()).toEqual({ q0: { payload: 'a', actionId: 'a0' } });
      expect(store.payload.company).toEqual({ payload: 'ACME', actionId: 'company-action' });
    });

    it('does not upload the files of a hidden question', async () => {
      const store = setupForm({ ...answers('a'), q1: { payload: [new File(['a'], 'a.txt')], actionId: 'a1' } });
      const upload = vi.spyOn(handler, 'post').mockResolvedValue({});

      await store.next();

      expect(vi.mocked(callSubmitForm).mock.calls[0][3]).toBe(false);
      expect(upload).not.toHaveBeenCalled();
    });
  });

  describe('answers on the path the respondent took', () => {
    beforeEach(async () => {
      const actual = await vi.importActual<typeof logicHelpers>('./helpers/logic');
      vi.mocked(logicHelpers.isBlockVisible).mockImplementation(actual.isBlockVisible);
      vi.mocked(logicHelpers.evaluateGotoLogic).mockImplementation(actual.evaluateGotoLogic);
    });

    afterEach(() => {
      vi.mocked(logicHelpers.isBlockVisible).mockReturnValue(true);
      vi.mocked(logicHelpers.evaluateGotoLogic).mockReset();
    });

    const shownIds = (store: ReturnType<typeof useConversation>) =>
      store.processedQueue.map((block) => block.id);

    it('lets a rule on a hidden question act as if it had no answer', () => {
      const store = useConversation();
      const [q0, q1, q2] = makeBlocks('q0', 'q1', 'q2');
      // q1 hides when q0 is "a", q2 shows when q1 is "yes"
      q1.logics = rule('hide', 'a');
      q2.logics = rule('show', 'yes', 'q1');
      store.queue = [q0, q1, q2];
      store.payload = { q0: { payload: 'a', actionId: 'a0' }, q1: { payload: 'yes', actionId: 'a1' } };
      // q1 was answered before q0 changed
      store.path = ['q0', 'q1'];

      expect(shownIds(store)).toEqual(['q0']);
    });

    it('lets a jump on a hidden question act as if it had no answer', async () => {
      const store = useConversation();
      const [q0, q1, q2, q3, q4] = makeBlocks('q0', 'q1', 'q2', 'q3', 'q4');
      // q1 hides when q0 is "a", q2 jumps to q4 when q1 is "yes"
      q1.logics = rule('hide', 'a');
      q2.logics = jump('q1', 'yes', 'q4');
      store.queue = [q0, q1, q2, q3, q4];
      store.payload = { q0: { payload: 'a', actionId: 'a0' }, q1: { payload: 'yes', actionId: 'a1' } };
      store.path = ['q0', 'q1'];
      store.current = 'q2';

      await store.next();

      expect(store.current).toBe('q3');
    });

    it('keeps a question shown when its own answer would hide it', () => {
      const store = useConversation();
      const [q0, q1] = makeBlocks('q0', 'q1');
      q1.logics = rule('hide', 'x', 'q1');
      store.queue = [q0, q1];
      store.payload = { q1: { payload: 'x', actionId: 'a1' } };
      store.path = ['q0'];
      store.current = 'q1';

      expect(shownIds(store)).toEqual(['q0', 'q1']);
    });

    // q1, q2, q3 by default; each question can be prefilled by its id
    const startForm = async (
      logics: Record<string, FormBlockLogic[]>,
      params: Record<string, string> = {},
      ids = ['q1', 'q2', 'q3'],
    ) => {
      const store = useConversation();
      const blocks = makeBlocks(...ids);
      blocks.forEach((block) => {
        block.title = block.id;
        block.interactions = [{ id: `a-${block.id}` } as PublicFormBlockInteractionModel];
        block.logics = logics[block.id];
      });
      vi.mocked(callGetFormStoryboard).mockResolvedValue({ data: { blocks } } as any);

      await store.initForm({ uuid: 'form' } as PublicFormModel, params);
      store.session = { token: 'session' } as FormSessionModel;

      return store;
    };

    const skipQ2 = { q1: jump('q1', 'skip', 'q3') };

    const type = (store: ReturnType<typeof useConversation>, value: string) =>
      store.setResponse(store.currentBlock!.interactions[0], value);

    // answers q2, goes back to q1 and jumps over q2
    const answerThenSkipQ2 = async (store: ReturnType<typeof useConversation>) => {
      type(store, 'stay');
      await store.next();
      type(store, 'two');
      store.back();
      type(store, 'skip');
      await store.next();
    };

    it('leaves out a typed answer of a question a jump skipped, but keeps it', async () => {
      const store = await startForm(skipQ2);
      await answerThenSkipQ2(store);

      expect(store.current).toBe('q3');

      await store.next();

      expect(sentAnswers()).toEqual({ q1: { payload: 'skip', actionId: 'a-q1' } });
      expect(store.payload.q2).toEqual({ payload: 'two', actionId: 'a-q2' });
    });

    it('leaves out a prefilled answer of a question a jump skipped', async () => {
      const store = await startForm(skipQ2, { q2: 'prefilled' });
      type(store, 'skip');
      await store.next();
      await store.next();

      expect(sentAnswers()).toEqual({ q1: { payload: 'skip', actionId: 'a-q1' } });
      expect(store.payload.q2).toEqual({ payload: 'prefilled', actionId: 'a-q2' });
    });

    it('lets a rule on a skipped question act as if it had no answer', async () => {
      // q1 jumps over the prefilled q2, and q4 shows when q2 is "BMW"
      const store = await startForm(
        { ...skipQ2, q4: rule('show', 'BMW', 'q2') },
        { q2: 'BMW' },
        ['q1', 'q2', 'q3', 'q4'],
      );
      type(store, 'skip');
      await store.next();

      expect(store.current).toBe('q3');
      expect(shownIds(store)).not.toContain('q4');
    });

    it('goes back along the path and shows the skipped answer again', async () => {
      const store = await startForm(skipQ2);
      await answerThenSkipQ2(store);

      store.back();

      expect(store.current).toBe('q1');

      type(store, 'stay');
      await store.next();

      expect(store.currentPayload).toEqual({ payload: 'two', actionId: 'a-q2' });

      await store.next();
      await store.next();

      expect(Object.keys(sentAnswers())).toEqual(['q1', 'q2']);
    });

    it('sends every answer of a form without rules or jumps', async () => {
      const store = await startForm({});

      for (const value of ['one', 'two', 'three']) {
        type(store, value);
        await store.next();
      }

      expect(sentAnswers()).toEqual({
        q1: { payload: 'one', actionId: 'a-q1' },
        q2: { payload: 'two', actionId: 'a-q2' },
        q3: { payload: 'three', actionId: 'a-q3' },
      });
    });
  });

  describe('submit on the last block', () => {
    const setupLastBlock = () => {
      const store = useConversation();

      // only answers of questions in the queue are sent
      store.queue = makeBlocks('block1');
      store.current = 'block1';
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