import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConversation } from './conversation';
import * as logicHelpers from './helpers/logic';

// Mock the logic helpers
vi.mock('./helpers/logic', async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule as any,
    evaluateGotoLogic: vi.fn(),
    isBlockVisible: vi.fn().mockReturnValue(true)
  };
});

describe('Conversation Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('executeGotoAction', () => {
    it('should navigate to target block when found', () => {
      const store = useConversation();
      
      // Setup a processed queue with multiple blocks
      const blocks = [
        { id: 'block1', type: 'text' },
        { id: 'block2', type: 'text' },
        { id: 'targetBlock', type: 'text' }
      ] as PublicFormBlockModel[];
      
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
      const blocks = [
        { id: 'block1', type: 'text' },
        { id: 'block2', type: 'text' }
      ] as PublicFormBlockModel[];
      
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
      
      // Mock blocks and current block
      const blocks = [
        { id: 'block1', type: 'text' },
        { id: 'targetBlock', type: 'text' }
      ] as PublicFormBlockModel[];
      
      // Setup store state
      vi.spyOn(store, 'processedQueue', 'get').mockReturnValue(blocks);
      vi.spyOn(store, 'currentBlock', 'get').mockReturnValue(blocks[0]);
      vi.spyOn(store, 'isLastBlock', 'get').mockReturnValue(false);
      store.current = 'block1';
      
      // Mock evaluation to return a goto target
      const evaluateGotoLogicMock = vi.mocked(logicHelpers.evaluateGotoLogic);
      evaluateGotoLogicMock.mockReturnValue({ target: 'targetBlock' });
      
      // Spy on executeGotoAction
      const executeGotoSpy = vi.spyOn(store, 'executeGotoAction');
      
      await store.next();
      
      // Verify goto was executed
      expect(evaluateGotoLogicMock).toHaveBeenCalledWith(blocks[0], {});
      expect(executeGotoSpy).toHaveBeenCalledWith('targetBlock');
    });
    
    it('should proceed normally when evaluateGotoLogic returns null', async () => {
      const store = useConversation();
      
      // Mock blocks and state
      const blocks = [
        { id: 'block1', type: 'text' },
        { id: 'block2', type: 'text' }
      ] as PublicFormBlockModel[];
      
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
      const blocks = [
        { id: 'block1', type: 'text' },
        { id: 'block2', type: 'text' }
      ] as PublicFormBlockModel[];
      
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
});