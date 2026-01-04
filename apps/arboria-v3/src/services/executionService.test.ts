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

    describe('getTaskById', () => {
        it('should fetch a single task with details', async () => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: '1', evidence: [] }, error: null })
            };
            (supabase.from as any).mockReturnValue(mockChain);

            const result = await executionService.getTaskById('1');

            expect(supabase.from).toHaveBeenCalledWith('tasks');
            expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
            expect(result.id).toBe('1');
        });
    });

    describe('logProgress', () => {
        it('should insert a progress log', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: 'log-1' }, error: null })
            };
            (supabase.from as any).mockReturnValue(mockChain);

            const result = await executionService.logProgress('task-1', 'user-1', 50, 'Halfway there');

            expect(supabase.from).toHaveBeenCalledWith('task_progress_log');
            expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({
                task_id: 'task-1',
                progress_percent: 50,
                notes: 'Halfway there'
            }));
            expect(result.id).toBe('log-1');
        });
    });

    describe('addEvidence', () => {
        it('should insert task evidence', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: 'ev-1' }, error: null })
            };
            (supabase.from as any).mockReturnValue(mockChain);

            const result = await executionService.addEvidence('task-1', 'before', 'http://photo.jpg', {}, 'Notes', { latitude: 10, longitude: 20 } as any);

            expect(supabase.from).toHaveBeenCalledWith('task_evidence');
            expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({
                task_id: 'task-1',
                stage: 'before',
                capture_lat: 10
            }));
            expect(result.id).toBe('ev-1');
        });
    });

    describe('createAlert', () => {
        it('should insert a task alert', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: 'alert-1' }, error: null })
            };
            (supabase.from as any).mockReturnValue(mockChain);

            const result = await executionService.createAlert('task-1', 'user-1', 'SOS', 'Need help');

            expect(supabase.from).toHaveBeenCalledWith('task_alerts');
            expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({
                alert_type: 'SOS',
                message: 'Need help'
            }));
            expect(result.id).toBe('alert-1');
        });
    });

    describe('blockTask', () => {
        it('should update task status to BLOCKED', async () => {
            const mockChain = {
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: '1', status: 'BLOCKED' }, error: null })
            };
            (supabase.from as any).mockReturnValue(mockChain);

            const result = await executionService.blockTask('1', 'Heavy rain');

            expect(mockChain.update).toHaveBeenCalledWith(expect.objectContaining({
                status: 'BLOCKED',
                notes: 'Heavy rain'
            }));
            expect(result.status).toBe('BLOCKED');
        });
    });

    describe('RPC methods', () => {
        it('getStatistics should call RPC get_execution_statistics', async () => {
            (supabase.rpc as any).mockResolvedValue({ data: { total_tasks: 10 }, error: null });
            const result = await executionService.getStatistics('inst-1');
            expect(supabase.rpc).toHaveBeenCalledWith('get_execution_statistics', { p_instalacao_id: 'inst-1' });
            expect(result.total_tasks).toBe(10);
        });

        it('getMyTasks should call RPC get_my_tasks', async () => {
            (supabase.rpc as any).mockResolvedValue({ data: [{ task_data: { id: '1' } }], error: null });
            const result = await executionService.getMyTasks('user-1', 'inst-1');
            expect(supabase.rpc).toHaveBeenCalledWith('get_my_tasks', { p_user_id: 'user-1', p_instalacao_id: 'inst-1' });
            expect(result[0].id).toBe('1');
        });

        it('createWorkOrderFromPlan should call RPC create_work_order_from_plan', async () => {
            (supabase.rpc as any).mockResolvedValue({ data: { work_order_id: 'wo-1' }, error: null });
            await executionService.createWorkOrderFromPlan('plan-1', 'user-1');
            expect(supabase.rpc).toHaveBeenCalledWith('create_work_order_from_plan', expect.anything());
        });

        it('approveTask should call RPC approve_task', async () => {
            (supabase.rpc as any).mockResolvedValue({ error: null });
            await executionService.approveTask('task-1', 'user-1');
            expect(supabase.rpc).toHaveBeenCalledWith('approve_task', { p_task_id: 'task-1', p_user_id: 'user-1' });
        });

        it('rejectTask should call RPC reject_task', async () => {
            (supabase.rpc as any).mockResolvedValue({ error: null });
            await executionService.rejectTask('task-1', 'user-1', 'Not good');
            expect(supabase.rpc).toHaveBeenCalledWith('reject_task', { p_task_id: 'task-1', p_user_id: 'user-1', p_reason: 'Not good' });
        });
    });
});
