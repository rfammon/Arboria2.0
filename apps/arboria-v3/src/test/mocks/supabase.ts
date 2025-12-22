import { vi } from 'vitest';

export const supabase = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    order: vi.fn(),
    rpc: vi.fn(),
    auth: {
        getUser: vi.fn(),
        getSession: vi.fn(),
    },
};

// Chainable mock helper
export const mockSupabaseChain = (data: any, error: any = null) => {
    const chain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data, error }),
        maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    };
    // If not ending with single(), we might need a `then` or just return promise
    // But usually for simple mocks we return the chain which resolves to data? 
    // Simplified for now.
    return chain;
};
