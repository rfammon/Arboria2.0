import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executionService } from './executionService';

// Define mock object first, but we can't share it easily with factory unless we use closure or separate file with __mocks__
// Easier approach for simple dependency:
const mockSupabaseChain = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    update: vi.fn(),
    single: vi.fn(),
    rpc: vi.fn(),
    then: vi.fn(),
    insert: vi.fn()
};

// Make chainable
mockSupabaseChain.select.mockReturnValue(mockSupabaseChain);
mockSupabaseChain.order.mockReturnValue(mockSupabaseChain);
mockSupabaseChain.eq.mockReturnValue(mockSupabaseChain);
mockSupabaseChain.update.mockReturnValue(mockSupabaseChain);
mockSupabaseChain.insert.mockReturnValue(mockSupabaseChain);

// Mock the module
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(),
    }
}));

// Get the mocked instance to assert on
import { supabase } from '../lib/supabase';


describe('executionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getTasks', () => {
        it('should fetch tasks with correct query structure', async () => {
            // Mock chain
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((cb) => cb({ data: [{ id: '1' }], error: null }))
            };

            // Setup base mock to return chain
            (supabase.from as any).mockReturnValue(mockChain);

            const result = await executionService.getTasks();

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockChain.select).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });

        it('should apply filters correctly', async () => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation((cb) => cb({ data: [], error: null }))
            };
            (supabase.from as any).mockReturnValue(mockChain);

            await executionService.getTasks({ status: 'IN_PROGRESS', priority: 'HIGH' });

            expect(mockChain.eq).toHaveBeenCalledWith('status', 'IN_PROGRESS');
            expect(mockChain.eq).toHaveBeenCalledWith('priority', 'HIGH');
        });
    });

    describe('startTask', () => {
        it('should update task status to IN_PROGRESS', async () => {
            const mockChain = {
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: '1', status: 'IN_PROGRESS' }, error: null })
            };
            (supabase.from as any).mockReturnValue(mockChain);

            const result = await executionService.startTask('1');

            expect(mockChain.update).toHaveBeenCalledWith(expect.objectContaining({
                status: 'IN_PROGRESS'
            }));
            expect(result.status).toBe('IN_PROGRESS');
        });
    });

    describe('completeTask', () => {
        it('should update task status to PENDING_APPROVAL', async () => {
            const mockChain = {
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: '1', status: 'PENDING_APPROVAL' }, error: null })
            };
            (supabase.from as any).mockReturnValue(mockChain);

            await executionService.completeTask('1', { notes: 'Done' });

            expect(mockChain.update).toHaveBeenCalledWith(expect.objectContaining({
                status: 'PENDING_APPROVAL',
                progress_percent: 100
            }));
        });
    });

    describe('reopenWorkOrder', () => {
        it('should call rpc reopen_work_order', async () => {
            (supabase.rpc as any).mockResolvedValue({ data: { success: true, message: 'Reopened' }, error: null });

            await executionService.reopenWorkOrder('wo-123', 'Mistake');

            expect(supabase.rpc).toHaveBeenCalledWith('reopen_work_order', expect.objectContaining({
                p_work_order_id: 'wo-123',
                p_reason: 'Mistake'
            }));
        });
    });
});
