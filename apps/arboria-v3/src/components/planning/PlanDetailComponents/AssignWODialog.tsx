import { Button } from '../../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';

interface AssignWODialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (assigneeId: string) => void;
    isGenerating: boolean;
    members: { user_id: string, nome: string }[];
    selectedAssignee: string;
    onAssigneeChange: (id: string) => void;
}

export function AssignWODialog({
    open,
    onOpenChange,
    onConfirm,
    isGenerating,
    members,
    selectedAssignee,
    onAssigneeChange
}: AssignWODialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gerar Ordem de Serviço</DialogTitle>
                    <DialogDescription>
                        Deseja atribuir esta tarefa a um membro específico da equipe?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <label className="text-sm font-medium mb-2 block">Responsável pela Execução</label>
                    <Select
                        value={selectedAssignee}
                        onValueChange={onAssigneeChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Deixar sem dono (Disponível para todos)</SelectItem>
                            {members.map(member => (
                                <SelectItem key={member.user_id} value={member.user_id}>
                                    {member.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={() => onConfirm(selectedAssignee)} disabled={isGenerating}>
                        {isGenerating ? 'Gerando...' : 'Confirmar e Gerar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
