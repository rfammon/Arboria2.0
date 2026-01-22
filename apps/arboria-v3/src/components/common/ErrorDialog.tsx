import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    error: {
        message: string;
        code?: string;
        details?: string;
        hint?: string;
    };
    title?: string;
}

export function ErrorDialog({ isOpen, onClose, error, title = 'Erro ao Salvar' }: ErrorDialogProps) {
    const [showDetails, setShowDetails] = useState(false);

    const copyErrorDetails = () => {
        const details = `
Erro: ${error.message}
Código: ${error.code || 'N/A'}
Detalhes: ${error.details || 'N/A'}
Dica: ${error.hint || 'N/A'}
        `.trim();

        navigator.clipboard.writeText(details);
        toast.success('Detalhes copiados para a área de transferência');
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <span>❌</span>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left space-y-3">
                        {/* Mensagem amigável para o usuário */}
                        <p className="text-base font-medium text-foreground">
                            {error.message}
                        </p>

                        {/* Detalhes técnicos (colapsados por padrão) */}
                        {(error.code || error.details || error.hint) && (
                            <div className="border-t pt-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
                                </Button>

                                {showDetails && (
                                    <div className="mt-2 p-3 bg-muted rounded text-xs font-mono space-y-1">
                                        {error.code && <div><strong>Código:</strong> {error.code}</div>}
                                        {error.details && <div><strong>Detalhes:</strong> {error.details}</div>}
                                        {error.hint && <div><strong>Dica:</strong> {error.hint}</div>}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyErrorDetails}
                                            className="mt-2 flex items-center gap-1"
                                        >
                                            <Copy size={12} />
                                            Copiar para Suporte
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>
                        Entendido
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
