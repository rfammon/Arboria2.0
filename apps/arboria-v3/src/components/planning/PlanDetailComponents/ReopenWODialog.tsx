import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';

interface ReopenWODialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string, date: string) => void;
    isReopening: boolean;
    reason: string;
    onReasonChange: (reason: string) => void;
    date: string;
    onDateChange: (date: string) => void;
}

export function ReopenWODialog({
    open,
    onOpenChange,
    onConfirm,
    isReopening,
    reason,
    onReasonChange,
    date,
    onDateChange
}: ReopenWODialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reabrir Ordem de Serviço</DialogTitle>
                    <DialogDescription>
                        A O.S. retornará para o status "Em Andamento". Informe o motivo e a nova data.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo da Reabertura (Obrigatório)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Descreva por que esta O.S. está sendo reaberta..."
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newDate">Nova Data de Início</Label>
                        <Input
                            id="newDate"
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={() => onConfirm(reason, date)} disabled={isReopening}>
                        {isReopening ? 'Reabrindo...' : 'Confirmar Reabertura'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
