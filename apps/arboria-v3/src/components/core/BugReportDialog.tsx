import { useState } from 'react';
import { Bug, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../ui/dialog';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Capacitor } from '@capacitor/core';

// App version from package.json (injected at build time)
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.1.64';

const bugTypes = [
    { value: 'crash', label: 'Aplicativo travou/fechou' },
    { value: 'ui', label: 'Erro visual ou interface' },
    { value: 'sync', label: 'Problema de sincronização' },
    { value: 'map', label: 'Mapa não carrega' },
    { value: 'login', label: 'Problema de login' },
    { value: 'performance', label: 'Lentidão' },
    { value: 'other', label: 'Outro' }
];

interface BugReportDialogProps {
    children: React.ReactNode;
}

export function BugReportDialog({ children }: BugReportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bugType, setBugType] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState('');
    const [email, setEmail] = useState('');

    const { user, activeInstallation } = useAuth();

    const handleSubmit = async () => {
        if (!bugType || !description) {
            toast.error('Preencha o tipo do problema e a descrição.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Collect automatic metadata
            const platform = Capacitor.getPlatform(); // 'web', 'android', 'ios'
            const userAgent = navigator.userAgent;

            const { error } = await supabase
                .from('bug_reports')
                .insert({
                    user_id: user?.id || null,
                    installation_id: activeInstallation?.id || null,
                    bug_type: bugType,
                    description: description.trim(),
                    steps_to_reproduce: steps.trim() || null,
                    contact_email: email.trim() || null,
                    app_version: APP_VERSION,
                    platform,
                    user_agent: userAgent
                });

            if (error) {
                console.error('Error submitting bug report:', error);
                toast.error('Erro ao enviar relato. Tente novamente.');
                return;
            }

            toast.success('Obrigado! Seu relato foi enviado com sucesso.');
            setIsOpen(false);
            setBugType('');
            setDescription('');
            setSteps('');
            setEmail('');
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error('Erro inesperado. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setBugType('');
            setDescription('');
            setSteps('');
            setEmail('');
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-rose-500" />
                        Reportar Problema
                    </DialogTitle>
                    <DialogDescription>
                        Encontrou um problema? Nos ajude a melhorar reportando abaixo.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="bug-type">Tipo de Problema *</Label>
                        <Select value={bugType} onValueChange={setBugType}>
                            <SelectTrigger id="bug-type">
                                <SelectValue placeholder="Selecione o tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {bugTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição do Problema *</Label>
                        <Textarea
                            id="description"
                            placeholder="Descreva o que aconteceu..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="steps">Passos para Reproduzir (opcional)</Label>
                        <Textarea
                            id="steps"
                            placeholder="1. Clique em...&#10;2. O sistema mostrou...&#10;3. Esperava que..."
                            value={steps}
                            onChange={(e) => setSteps(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Seu Email (opcional)</Label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex h-[var(--touch-target,40px)] w-full rounded-md border border-input bg-background px-3 py-2 text-[var(--font-size-md,14px)] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
