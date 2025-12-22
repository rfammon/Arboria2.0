import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Building, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface InstallationSwitchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InstallationSwitchDialog({ open, onOpenChange }: InstallationSwitchDialogProps) {
    const { installations, activeInstallation, setActiveInstallation } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSelect = async (installation: any) => {
        setLoading(true);
        try {
            setActiveInstallation(installation);
            onOpenChange(false);

            // Optional: Navigate to Dashboard to ensure clean state or just reload
            navigate('/');
            // A hard reload might be safer if there are deeply nested contexts dependent on installation ID
            // window.location.href = '/'; 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Trocar Instalação</DialogTitle>
                    <DialogDescription>
                        Selecione a instalação que deseja acessar.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4 max-h-[60vh] overflow-y-auto">
                    {installations.map((inst) => {
                        const isActive = activeInstallation?.id === inst.id;
                        return (
                            <Button
                                key={inst.id}
                                variant="outline"
                                className={cn(
                                    "justify-between h-auto py-3 px-4",
                                    isActive && "border-primary bg-primary/5"
                                )}
                                onClick={() => handleSelect(inst)}
                                disabled={loading}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-full",
                                        isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">{inst.nome}</span>
                                        <span className="text-xs text-muted-foreground">{inst.tipo}</span>
                                    </div>
                                </div>
                                {isActive && <Check className="w-4 h-4 text-primary" />}
                            </Button>
                        );
                    })}
                    {installations.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Nenhuma instalação encontrada.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
