import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleStatus = 'locked' | 'available' | 'completed' | 'tested_out';

interface ModuleState {
    id: string;
    status: ModuleStatus;
    score: number;
}

interface Streak {
    current: number;
    lastActivityDate: string | null;
}

interface EducationStore {
    modules: Record<string, ModuleState>;
    isHighContrast: boolean;
    certificationStatus: 'idle' | 'in_progress' | 'certified' | 'failed';
    streak: Streak;

    completeModule: (moduleId: string, score: number, testedOut?: boolean) => void;
    unlockModule: (moduleId: string) => void;
    toggleHighContrast: () => void;
    startCertification: () => void;
    grantCertification: () => void;
    failCertification: () => void;
    updateStreak: () => void;
}

export const useEducationStore = create<EducationStore>()(
    persist(
        (set, get) => ({
            modules: {
                // Initial State mimicking the hardcoded topics in Education.tsx
                'concepts': { id: 'concepts', status: 'locked', score: 0 },
                'safety': { id: 'safety', status: 'available', score: 0 }, // Core Module
                'planning': { id: 'planning', status: 'locked', score: 0 },
                'legal': { id: 'legal', status: 'locked', score: 0 },
                'prep': { id: 'prep', status: 'locked', score: 0 },
                'writing': { id: 'writing', status: 'locked', score: 0 },
                'pruning': { id: 'pruning', status: 'locked', score: 0 },
                'ops': { id: 'ops', status: 'locked', score: 0 },
                'risk': { id: 'risk', status: 'locked', score: 0 },
                'sim_certification': { id: 'sim_certification', status: 'locked', score: 0 } // Epic 3 Gate
            },
            isHighContrast: false,
            certificationStatus: 'idle',
            streak: { current: 0, lastActivityDate: null },

            toggleHighContrast: () => set((state) => ({ isHighContrast: !state.isHighContrast })),
            startCertification: () => set({ certificationStatus: 'in_progress' }),
            failCertification: () => set({ certificationStatus: 'failed' }),

            grantCertification: () => set((state) => {
                const updatedModules = { ...state.modules };

                // Unlock Epic 2 modules upon certification
                ['ops', 'risk', 'pruning'].forEach(id => {
                    if (updatedModules[id]) {
                        updatedModules[id] = { ...updatedModules[id], status: 'available' };
                    }
                });

                return {
                    certificationStatus: 'certified',
                    modules: updatedModules
                };
            }),

            completeModule: (moduleId, score, testedOut = false) => {
                set((state) => {
                    const current = state.modules[moduleId];
                    if (!current) return state;

                    const newStatus = testedOut ? 'tested_out' : 'completed';

                    return {
                        modules: {
                            ...state.modules,
                            [moduleId]: {
                                ...current,
                                status: newStatus,
                                score: Math.max(current.score, score)
                            }
                        }
                    };
                });
                // Update streak on completion
                get().updateStreak();
            },

            unlockModule: (moduleId) => set((state) => {
                const current = state.modules[moduleId];
                if (!current) return state;

                return {
                    modules: {
                        ...state.modules,
                        [moduleId]: { ...current, status: 'available' }
                    }
                };
            }),

            updateStreak: () => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const state = get();
                const lastActivity = state.streak.lastActivityDate;

                if (!lastActivity) {
                    // First ever activity
                    set({ streak: { current: 1, lastActivityDate: today } });
                    return;
                }

                if (lastActivity === today) {
                    // Already active today, no change
                    return;
                }

                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastActivity === yesterdayStr) {
                    // Consecutive day
                    set({ streak: { current: state.streak.current + 1, lastActivityDate: today } });
                } else {
                    // Broken streak
                    set({ streak: { current: 1, lastActivityDate: today } });
                }
            }
        }),
        {
            name: 'education-storage', // unique name
        }
    )
);
