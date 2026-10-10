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

  it('reads only real params for Identifiers like constructor', () => {
    const blocks = ['constructor', 'toString', 'valueOf', '__proto__']
      .map((title, index) => makeBlock(`q${index}`, title));

    expect(prefillPayload(blocks, {})).toEqual({});
    expect(prefillPayload(blocks, { constructor: 'Ada' })).toEqual({
      q0: { payload: 'Ada', actionId: 'q0-action' },
    });
  });

  it('ignores a number param that is not digits with a dot', () => {
    const blocks = [makeBlock('q1', 'size', 'input-number')];

    ['large', '0x10', '1e3', 'Infinity', '12,5'].forEach((size) => {
      expect(prefillPayload(blocks, { size })).toEqual({});
    });
  });

  it('rounds a number to the decimal places of the question', () => {
    const age = makeBlock('q1', 'age', 'input-number');
    const price = makeBlock('q2', 'price', 'input-number');
    price.interactions[0].options = { decimalPlaces: 2 };

    expect(prefillPayload([age, price], { age: '12.5', price: '-3.14159' })).toEqual({
      q1: { payload: 13, actionId: 'q1-action' },
      q2: { payload: -3.14, actionId: 'q2-action' },
    });
  });
});
