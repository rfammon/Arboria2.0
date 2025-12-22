import { useState } from 'react';
import { AlertCircle, ShieldAlert, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import type { AlertType } from '@/types/execution';
import { useTaskMutations } from '@/hooks/useExecution';
// We should get userId from AuthContext, importing useAuth if available or assuming prop
// For now, let's assume userId is passed or retrieved from a hook we add later to keep this pure

interface SOSButtonProps {
    userId: string;
    className?: string;
    taskId?: string | null;
}

export function SOSButton({ userId, className, taskId = null }: SOSButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { createAlert } = useTaskMutations();
    const [isSending, setIsSending] = useState(false);

    const handleSOS = async (type: AlertType, message: string) => {
        setIsSending(true);
        // Get location
        const location = undefined;
        try {
            // Mock geolocation for component demo
            // In real use, we'd use navigator.geolocation
        } catch (e) { }

        createAlert.mutate({
            taskId,
            userId,
            type,
            message,
            location
        }, {
            onSuccess: () => {
                setIsOpen(false);
                setIsSending(false);
            },
            onError: () => setIsSending(false)
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="lg"
                    className={cn(
                        "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 animate-pulse hover:animate-none border-4 border-white/20",
                        className
                    )}
                >
                    <div className="flex flex-col items-center">
                        <ShieldAlert className="w-6 h-6" />
                        <span className="text-[10px] font-bold">SOS</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-red-500 border-2">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        EMERGÊNCIA / SOS
                    </DialogTitle>
                    <DialogDescription>
                        Acione este alerta apenas em caso de riscos reais, acidentes ou necessidade de ajuda imediata.
                        Todos os gestores serão notificados com sua localização.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Button
                        variant="destructive"
                        className="h-16 text-lg bg-red-600 hover:bg-red-700 font-bold"
                        onClick={() => handleSOS('SOS', 'Emergência Médica / Acidente')}
                        disabled={isSending}
                    >
                        <AlertCircle className="mr-2 h-6 w-6" />
                        ACIDENTE / MÉDICA
                    </Button>

                    <Button
                        className="h-14 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                        onClick={() => handleSOS('SAFETY_ISSUE', 'Risco iminente de segurança')}
                        disabled={isSending}
                    >
                        <ShieldAlert className="mr-2 h-5 w-5" />
                        RISCO DE SEGURANÇA
                    </Button>

                    <Button
                        variant="outline"
                        className="h-14 border-red-200 hover:bg-red-50 text-red-700"
                        onClick={() => handleSOS('HELP', 'Solicitação de apoio urgente da equipe')}
                        disabled={isSending}
                    >
                        <Phone className="mr-2 h-5 w-5" />
                        APOIO IMEDIATO
                    </Button>
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button variant="secondary" className="w-full" onClick={() => setIsOpen(false)}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
