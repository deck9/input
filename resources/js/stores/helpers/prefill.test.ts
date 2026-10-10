import { describe, it, expect } from 'vitest';
import { prefillPayload } from './prefill';

const makeBlock = (
  id: string,
  title: string | null,
  type: FormBlockType = 'input-short',
): PublicFormBlockModel => ({
  id,
  message: null,
  title,
  type,
  parent_block: null,
  is_required: false,
  interactions: [{ id: `${id}-action` } as PublicFormBlockInteractionModel],
  logics: undefined,
});

describe('prefillPayload', () => {
  it('fills the question whose Identifier matches the param', () => {
    const blocks = [makeBlock('q1', 'email', 'input-email'), makeBlock('q2', 'name')];

    expect(prefillPayload(blocks, { email: 'a@b.de' })).toEqual({
      q1: { payload: 'a@b.de', actionId: 'q1-action' },
    });
  });

  it('ignores params for unknown Identifiers and empty values', () => {
    const blocks = [makeBlock('q1', 'name'), makeBlock('q2', null)];

    expect(prefillPayload(blocks, { email: 'a@b.de', name: ' ', '': 'x' })).toEqual({});
  });

  it('ignores questions that are not text', () => {
    const blocks = (['radio', 'checkbox', 'input-secret', 'date', 'group'] as FormBlockType[])
      .map((type) => makeBlock(type, 'answer', type));

    expect(prefillPayload(blocks, { answer: 'yes' })).toEqual({});
  });

  it('keeps a value with HTML as plain text', () => {
    const html = '<img src=x onerror=alert(1)>';

    expect(prefillPayload([makeBlock('q1', 'name')], { name: html })).toEqual({
      q1: { payload: html, actionId: 'q1-action' },
    });
  });

  it('fills a number question only with a number', () => {
    const blocks = [makeBlock('q1', 'age', 'input-number'), makeBlock('q2', 'size', 'input-number')];

    expect(prefillPayload(blocks, { age: '42', size: 'large' })).toEqual({
      q1: { payload: 42, actionId: 'q1-action' },
    });
  });
});
