import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type FilterState = {
    search: string;
    species: string | 'all';
    riskLevel: string | 'all';
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
};

type FilterContextType = {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    resetFilters: () => void;
};

const defaultFilters: FilterState = {
    search: '',
    species: 'all',
    riskLevel: 'all',
    dateRange: { start: null, end: null },
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [filters, setFilters] = useState<FilterState>(defaultFilters);

    const resetFilters = () => setFilters(defaultFilters);

    return (
        <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};
