import { useState } from 'react';
import { AlertCircle, ShieldAlert, Phone, HeartPulse, LifeBuoy } from 'lucide-react';
import { toast } from 'sonner';
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
import { SafetyConfigDialog } from '../safety/SafetyConfigDialog';
import { FirstAidWizard } from '../safety/FirstAidWizard';
import { useSafetyStore } from '@/stores/useSafetyStore';
import { NotificationService } from '../../lib/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useInstallationMembers } from '../../hooks/useInstallation';

interface SOSButtonProps {
  userId: string;
  className?: string;
  taskId?: string | null;
}

type Mode = 'menu' | 'wizard';

export function SOSButton({ userId, className, taskId = null }: SOSButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');
  const { createAlert } = useTaskMutations();
  const [isSending, setIsSending] = useState(false);
  const { emergencyContacts } = useSafetyStore();
  const { activeInstallation, user } = useAuth();
  const { data: members } = useInstallationMembers(activeInstallation?.id);

  const primaryContact = emergencyContacts[0]?.phone || '193';

  const handleSOS = async (type: AlertType, message: string) => {
    setIsSending(true);

    let location: { lat: number; lng: number } | undefined = undefined;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (e) {
      console.warn('Could not get geolocation for SOS:', e);
    }

    try {
      const alert = await createAlert.mutateAsync({
        taskId,
        userId,
        type,
        message,
        location
      });

      // Send push notifications to other members
      if (members && user) {
        const otherMemberIds = members
          .map((m: any) => m.user_id)
          .filter((id: string) => id !== user.id);

        if (otherMemberIds.length > 0) {
          NotificationService.sendPushNotification(
            otherMemberIds,
            `🚨 SOS: ${user.email} precisa de ajuda!`,
            `Mensagem: ${message}. Toque para ver a localização.`,
            { 
              type: 'sos', 
              taskId, 
              lat: location?.lat, 
              lng: location?.lng 
            }
          ).catch(err => console.error('Error sending SOS push notifications:', err));
        }
      }

      setIsOpen(false);
      toast.success('Alerta de SOS enviado!');
    } catch (e) {
      console.error('Erro ao enviar SOS:', e);
      toast.error('Falha ao enviar alerta de SOS.');
    } finally {
      setIsSending(false);
    }
  };

  const resetAndClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => setMode('menu'), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
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
      <DialogContent className={cn(
        "sm:max-w-md border-red-500 border-2 transition-all duration-300",
        mode === 'wizard' ? "max-h-[90vh] overflow-y-auto" : ""
      )}>
        {mode === 'menu' ? (
          <>
            <DialogHeader className="relative">
              <div className="absolute right-0 top-0">
                <SafetyConfigDialog />
              </div>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                CENTRAL DE EMERGÊNCIA
              </DialogTitle>
              <DialogDescription>
                Selecione uma ação imediata ou acione os protocolos de ajuda.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Button
                asChild
                className="h-20 text-xl bg-red-600 hover:bg-red-700 font-black shadow-lg shadow-red-200"
              >
                <a href={`tel:${primaryContact}`}>
                  <Phone className="mr-3 h-8 w-8 animate-bounce" />
                  LIGAR EMERGÊNCIA
                </a>
              </Button>

              <Button
                className="h-16 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg"
                onClick={() => setMode('wizard')}
              >
                <HeartPulse className="mr-2 h-6 w-6" />
                PRIMEIROS SOCORROS
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-red-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Enviar Alerta Silencioso</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 border-red-200 hover:bg-red-50 text-red-700 font-semibold"
                  onClick={() => handleSOS('SOS', 'Emergência Médica / Acidente')}
                  disabled={isSending}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  ACIDENTE
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 border-orange-200 hover:bg-orange-50 text-orange-700 font-semibold"
                  onClick={() => handleSOS('SAFETY_ISSUE', 'Risco iminente de segurança')}
                  disabled={isSending}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  RISCO SEG.
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold col-span-2"
                  onClick={() => handleSOS('HELP', 'Solicitação de apoio urgente da equipe')}
                  disabled={isSending}
                >
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  SOLICITAR APOIO DA EQUIPE
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" className="w-full" onClick={() => setIsOpen(false)}>
                Fechar Central
              </Button>
            </DialogFooter>
          </>
        ) : (
          <FirstAidWizard onBack={() => setMode('menu')} />
        )}
      </DialogContent>
    </Dialog>
  );
}
