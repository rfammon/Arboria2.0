import { create } from 'zustand';

interface ErrorState {
    isOpen: boolean;
    error: {
        message: string;
        code?: string;
        details?: string;
        hint?: string;
    } | null;
    title?: string;
    showError: (error: any, title?: string) => void;
    closeError: () => void;
}

export const useErrorDialog = create<ErrorState>((set) => ({
    isOpen: false,
    error: null,
    title: undefined,

    showError: (error, title) => {
        set({
            isOpen: true,
            error: {
                message: error?.message || 'Erro desconhecido',
                code: error?.code,
                details: error?.details,
                hint: error?.hint
            },
            title
        });
    },

    closeError: () => {
        set({ isOpen: false, error: null });
    }
}));
