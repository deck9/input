import { describe, it, expect } from 'vitest';
import { evaluateCondition, evaluateGotoLogic, isBlockVisible } from './logic';

const makeBlock = (logics?: FormBlockLogic[]): PublicFormBlockModel => ({
  id: 'block1',
  message: null,
  title: null,
  type: 'input-short',
  parent_block: null,
  is_required: false,
  interactions: [],
  logics,
});

const makeLogic = (logic: Partial<FormBlockLogic>): FormBlockLogic => ({
  form_block_id: 1,
  name: 'Rule',
  action: 'goto',
  evaluate: 'after',
  action_payload: 'targetBlock',
  conditions: [],
  ...logic,
});

const equals = (
  source: string,
  value: string,
  chainOperator: 'and' | 'or' = 'and',
): FormBlockLogicCondition => ({ source, operator: 'equals', value, chainOperator });

describe('Logic Helpers', () => {
  describe('evaluateCondition', () => {
    const condition = (operator: Operator, value: string): FormBlockLogicCondition => ({
      source: 'block0',
      operator,
      value,
      chainOperator: 'and',
    });

    // rule values are always text, rating, scale and number answers are numbers
    it.each([
      ['equals', '1', 1, true],
      ['equalsNot', '1', 1, false],
      ['contains', '5', 150, true],
      ['containsNot', '5', 150, false],
      ['isGreaterThan', '9', 10, true],
      ['isLowerThan', '9', '10', false],
      ['isGreaterThan', '5', 'abc', false],
      ['isLowerThan', '1', '', false],
      ['isLowerThan', '1', false, false],
      ['isGreaterThan', 'abc', 5, false],
    ] as const)('%s "%s" on the answer %j is %s', (operator, value, answer, expected) => {
      expect(evaluateCondition(condition(operator, value), answer)).toBe(expected);
    });

    it('fires "equals 1" for a rating answer of 1', () => {
      const block = makeBlock([makeLogic({ conditions: [equals('block1', '1')] })]);

      expect(evaluateGotoLogic(block, { block1: { payload: 1, actionId: '123' } })).toEqual({
        target: 'targetBlock',
      });
    });
  });

  describe('evaluateGotoLogic', () => {
    it('should return null if block has no logics', () => {
      const result = evaluateGotoLogic(makeBlock(), {});
      expect(result).toBeNull();
    });

    it('should return null if block has empty logics array', () => {
      const result = evaluateGotoLogic(makeBlock([]), {});
      expect(result).toBeNull();
    });

    it('should return null if no matching goto logics', () => {
      const block = makeBlock([
        makeLogic({ action: 'show', evaluate: 'before', action_payload: null })
      ]);
      const result = evaluateGotoLogic(block, {});
      expect(result).toBeNull();
    });

    it('should return null if there are goto logics but they are not evaluated as "after"', () => {
      const block = makeBlock([makeLogic({ evaluate: 'before' })]);
      const result = evaluateGotoLogic(block, {});
      expect(result).toBeNull();
    });

    it('should return target when conditions are met', () => {
      const block = makeBlock([
        makeLogic({ conditions: [equals('block1', 'yes')] })
      ]);

      const payload = {
        block1: { payload: 'yes', actionId: '123' }
      };

      const result = evaluateGotoLogic(block, payload);
      expect(result).toEqual({ target: 'targetBlock' });
    });

    it('should return null when conditions are not met', () => {
      const block = makeBlock([
        makeLogic({ conditions: [equals('block1', 'yes')] })
      ]);

      const payload = {
        block1: { payload: 'no', actionId: '123' }
      };

      const result = evaluateGotoLogic(block, payload);
      expect(result).toBeNull();
    });

    it('should evaluate multiple conditions with AND correctly', () => {
      const block = makeBlock([
        makeLogic({
          conditions: [equals('block1', 'yes'), equals('block2', 'true')]
        })
      ]);

      // All conditions met
      const payloadAllMet = {
        block1: { payload: 'yes', actionId: '123' },
        block2: { payload: 'true', actionId: '456' }
      };

      expect(evaluateGotoLogic(block, payloadAllMet)).toEqual({ target: 'targetBlock' });

      // One condition not met
      const payloadOneMissing = {
        block1: { payload: 'yes', actionId: '123' },
        block2: { payload: 'false', actionId: '456' }
      };

      expect(evaluateGotoLogic(block, payloadOneMissing)).toBeNull();
    });

    it('should evaluate multiple conditions with OR correctly', () => {
      const block = makeBlock([
        makeLogic({
          conditions: [equals('block1', 'yes'), equals('block2', 'yes', 'or')]
        })
      ]);

      // Only the second condition met
      const payloadOneMet = {
        block1: { payload: 'no', actionId: '123' },
        block2: { payload: 'yes', actionId: '456' }
      };

      expect(evaluateGotoLogic(block, payloadOneMet)).toEqual({ target: 'targetBlock' });

      // No condition met
      const payloadNoneMet = {
        block1: { payload: 'no', actionId: '123' },
        block2: { payload: 'no', actionId: '456' }
      };

      expect(evaluateGotoLogic(block, payloadNoneMet)).toBeNull();
    });
  });

  describe('isBlockVisible', () => {
    it('should hide the block when a hide condition is met', () => {
      const block = makeBlock([
        makeLogic({
          action: 'hide',
          evaluate: 'before',
          action_payload: null,
          conditions: [equals('block0', 'yes')]
        })
      ]);

      expect(isBlockVisible(block, { block0: { payload: 'yes', actionId: '123' } })).toBe(false);
      expect(isBlockVisible(block, { block0: { payload: 'no', actionId: '123' } })).toBe(true);
    });
  });
});
