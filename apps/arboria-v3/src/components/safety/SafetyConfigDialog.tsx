import { useState } from 'react';
import { useSafetyStore } from '@/stores/useSafetyStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Settings, User } from 'lucide-react';
import { toast } from 'sonner';

export function SafetyConfigDialog() {
  const { emergencyContacts, medicalInfo, addContact, removeContact, updateMedicalInfo } = useSafetyStore();
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddContact = () => {
    if (!newName || !newPhone) {
      toast.error('Preencha nome e telefone');
      return;
    }
    addContact({ name: newName, phone: newPhone, relation: 'Contato' });
    setNewName('');
    setNewPhone('');
    toast.success('Contato adicionado');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações de Segurança</DialogTitle>
          <DialogDescription>
            Gerencie seus contatos de emergência e informações médicas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> Contatos de Emergência
            </h3>
            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-2 border-t pt-4">
              <Label htmlFor="newName" className="text-xs">Novo Contato</Label>
              <div className="flex gap-2">
                <Input
                  id="newName"
                  placeholder="Nome"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  id="newPhone"
                  placeholder="Telefone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddContact} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium">Informações Médicas</h3>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="bloodType">Tipo Sanguíneo</Label>
                <Input
                  id="bloodType"
                  value={medicalInfo.bloodType}
                  onChange={(e) => updateMedicalInfo({ bloodType: e.target.value })}
                  placeholder="Ex: O+"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  value={medicalInfo.allergies}
                  onChange={(e) => updateMedicalInfo({ allergies: e.target.value })}
                  placeholder="Liste suas alergias..."
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
