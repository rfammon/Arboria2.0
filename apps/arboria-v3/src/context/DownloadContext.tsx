import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { set, get } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { type DownloadItem } from '@/types/downloads';
import { platform } from '@/platform';
import { toast } from 'sonner';

// Global types moved to src/types/tauri.d.ts

interface DownloadContextType {
    downloads: DownloadItem[];
    addDownload: (item: Omit<DownloadItem, 'id' | 'timestamp' | 'progress' | 'status'>) => string;
    updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
    removeDownload: (id: string) => void;
    deleteDownload: (id: string, deleteFile: boolean) => Promise<void>;
    clearHistory: () => void;
    downloadDirectory: string | null;
    setDownloadDirectory: (path: string | null) => void;
    selectDownloadDirectory: () => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

const IDB_KEY = 'arboria_downloads_v1';

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);

    // Load from IDB on init
    useEffect(() => {
        const loadDownloads = async () => {
            try {
                const saved = await get<DownloadItem[]>(IDB_KEY);
                if (saved) {
                    setDownloads(saved);
                }
            } catch (err) {
                console.error('Failed to load downloads from IDB:', err);
            }
        };
        loadDownloads();
    }, []);

    // Save to IDB whenever downloads change
    useEffect(() => {
        set(IDB_KEY, downloads).catch(err => console.error('Failed to save downloads to IDB:', err));
    }, [downloads]);

    // Download Directory Logic
    const [downloadDirectory, setDownloadDirectoryState] = useState<string | null>(null);

    useEffect(() => {
        const loadDir = async () => {
            const savedDir = await get<string>('download_directory');
            if (savedDir) setDownloadDirectoryState(savedDir);
        };
        loadDir();
    }, []);

    const setDownloadDirectory = (path: string | null) => {
        setDownloadDirectoryState(path);
        if (path) {
            set('download_directory', path).catch(console.error);
        } else {
            set('download_directory', null).catch(console.error); // Consider del here if supported
        }
    };

    const selectDownloadDirectory = async () => {
        if (!platform.selectDirectory) {
            console.warn("Folder selection is not available on this platform.");
            return;
        }

        try {
            const selected = await platform.selectDirectory();
            if (selected) {
                setDownloadDirectory(selected);
            }
        } catch (error) {
            console.error("Failed to select directory:", error);
            toast.error("Erro ao selecionar pasta.");
        }
    };

    const addDownload = useCallback((item: Omit<DownloadItem, 'id' | 'timestamp' | 'progress' | 'status'>) => {
        const id = uuidv4();
        const newItem: DownloadItem = {
            ...item,
            id,
            timestamp: Date.now(),
            progress: 0,
            status: 'progress',
        };
        setDownloads(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
        return id;
    }, []);

    const updateDownload = useCallback((id: string, updates: Partial<DownloadItem>) => {
        setDownloads(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    }, []);

    const removeDownload = useCallback((id: string) => {
        setDownloads(prev => prev.filter(item => item.id !== id));
    }, []);

    const deleteDownload = useCallback(async (id: string, deleteFile: boolean) => {
        const item = downloads.find(d => d.id === id);
        if (!item) return;

        if (deleteFile && item.path && platform.deleteFile) {
            try {
                await platform.deleteFile(item.path);
                toast.success('Arquivo excluído com sucesso.');
            } catch (err) {
                console.error('Failed to delete physical file:', err);
                toast.error(`Falha ao excluir arquivo físico: ${err}`);
                // We still remove it from the list anyway to allow UI cleanup
            }
        }

        removeDownload(id);
    }, [downloads, removeDownload]);

    const clearHistory = useCallback(() => {
        setDownloads([]);
    }, []);

    return (
        <DownloadContext.Provider value={{
            downloads,
            addDownload,
            updateDownload,
            removeDownload,
            deleteDownload,
            clearHistory,
            downloadDirectory,
            setDownloadDirectory,
            selectDownloadDirectory
        }}>
            {children}
        </DownloadContext.Provider>
    );
};

export const useDownloads = () => {
    const context = useContext(DownloadContext);
    if (context === undefined) {
        throw new Error('useDownloads must be used within a DownloadProvider');
    }
    return context;
};
