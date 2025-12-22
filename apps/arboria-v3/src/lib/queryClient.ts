import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours (cache persistence)
            retry: 1,
            refetchOnWindowFocus: false, // Better for offline-first
            networkMode: 'offlineFirst', // CRITICAL for offline apps
        },
        mutations: {
            networkMode: 'offlineFirst',
        },
    },
});
