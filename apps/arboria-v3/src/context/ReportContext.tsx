import React, { createContext, useContext, useState, useCallback } from 'react';
import { type ReportType } from '../components/reports/ReportSelector';

interface CaptureRequest {
    id: string;
    type: ReportType;
    selectedId?: string;
    data?: any;
}

interface ReportContextType {
    queue: CaptureRequest[];
    requestCapture: (type: ReportType, selectedId?: string, data?: any) => string;
    completeCapture: (id: string) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [queue, setQueue] = useState<CaptureRequest[]>([]);

    const requestCapture = useCallback((type: ReportType, selectedId?: string, data?: any) => {
        const id = Math.random().toString(36).substring(7);
        setQueue(prev => [...prev, { id, type, selectedId, data }]);
        return id;
    }, []);

    const completeCapture = useCallback((id: string) => {
        setQueue(prev => prev.filter(req => req.id !== id));
    }, []);

    return (
        <ReportContext.Provider value={{ queue, requestCapture, completeCapture }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReports = () => {
    const context = useContext(ReportContext);
    if (context === undefined) {
        throw new Error('useReports must be used within a ReportProvider');
    }
    return context;
};
