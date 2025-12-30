import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface Definition {
    term: string;
    description: string;
}

interface DefinitionContextType {
    isOpen: boolean;
    activeDefinition: Definition | null;
    openDefinition: (term: string, description: string) => void;
    closeDefinition: () => void;
}

const DefinitionContext = createContext<DefinitionContextType | null>(null);

export function DefinitionProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeDefinition, setActiveDefinition] = useState<Definition | null>(null);

    const openDefinition = useCallback((term: string, description: string) => {
        setActiveDefinition({ term, description });
        setIsOpen(true);
    }, []);

    const closeDefinition = useCallback(() => {
        setIsOpen(false);
        // Optional: clear definition after animation, but simpler to keep for now
        // setActiveDefinition(null); 
    }, []);

    return (
        <DefinitionContext.Provider value={{ isOpen, activeDefinition, openDefinition, closeDefinition }}>
            {children}
        </DefinitionContext.Provider>
    );
}

export function useDefinition() {
    const context = useContext(DefinitionContext);
    if (!context) {
        throw new Error('useDefinition must be used within a DefinitionProvider');
    }
    return context;
}
