import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';

interface ConflictResolutionModalProps {
    isOpen: boolean;
    localData: any;
    serverData: any;
    onResolve: (strategy: 'local' | 'server') => void;
}

export function ConflictResolutionModal({ isOpen, localData, serverData, onResolve }: ConflictResolutionModalProps) {
    if (!isOpen) return null;

    // Helper to format values for display
    const formatValue = (value: any) => {
        if (value === null || value === undefined) return <span className="text-muted-foreground italic">Vazio</span>;
        if (typeof value === 'object' && value instanceof Date) return format(value, 'dd/MM/yyyy HH:mm');
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    // Identify changed fields (comparing local payload data against server)
    // localData is likely just the fields that were edited or the full form data at time of edit
    const conflictingFields = Object.keys(localData).filter(key => {
        if (key === 'original_updated_at' || key === 'updated_at' || key === 'instalacao_id') return false; // Skip metadata
        // Loose equality for date strings vs objects might be tricky, but let's try strict for now
        // or just show all fields that exist in localData
        return JSON.stringify(localData[key]) !== JSON.stringify(serverData[key]);
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border flex flex-col">

                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-border bg-destructive/10">
                    <div className="bg-destructive/20 p-2 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Conflito de Sincronização Detectado</h2>
                        <p className="text-sm text-muted-foreground">
                            A árvore foi modificada no servidor por outro usuário (ou sessão) enquanto você estava offline.
                        </p>
                    </div>
                </div>

                {/* Comparison Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Server Version */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Versão no Servidor
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    Atualizado em: {serverData?.updated_at ? format(new Date(serverData.updated_at), 'dd/MM HH:mm') : '-'}
                                </span>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-3">
                                {conflictingFields.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma diferença visível nos campos editados.</p>}
                                {conflictingFields.map(key => (
                                    <div key={`server-${key}`} className="grid grid-cols-1 gap-1">
                                        <span className="text-xs font-mono text-muted-foreground uppercase">{key}</span>
                                        <div className="text-sm font-medium bg-background p-2 rounded border border-border">
                                            {formatValue(serverData[key])}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => onResolve('server')}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Descartar Minhas Mudanças
                            </Button>
                        </div>

                        {/* Local Version */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Sua Versão Offline
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    Editado agora
                                </span>
                            </div>
                            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-900 space-y-3">
                                {conflictingFields.map(key => (
                                    <div key={`local-${key}`} className="grid grid-cols-1 gap-1">
                                        <span className="text-xs font-mono text-muted-foreground uppercase">{key}</span>
                                        <div className="text-sm font-medium bg-background p-2 rounded border border-green-200 dark:border-green-900">
                                            {formatValue(localData[key])}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => onResolve('local')}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Forçar Minhas Mudanças
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-muted/20 border-t border-border text-center text-xs text-muted-foreground">
                    Ao escolher "Forçar Minhas Mudanças", os dados do servidor serão sobrescritos pelos seus.
                </div>
            </div>
        </div>
    );
}
