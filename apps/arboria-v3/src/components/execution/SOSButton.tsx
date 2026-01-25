import { useState, useEffect, useRef } from 'react';
import { AlertCircle, ShieldAlert, Phone, HeartPulse, LifeBuoy, X } from 'lucide-react';
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
import type { AlertType, GeolocationPosition as AppGeolocationPosition } from '@/types/execution';
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

type Mode = 'menu' | 'wizard' | 'countdown';

interface PendingAlert {
  type: AlertType;
  message: string;
  isCall?: boolean;
}

export function SOSButton({ userId, className, taskId = null }: SOSButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');
  const { createAlert } = useTaskMutations();
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [pendingAlert, setPendingAlert] = useState<PendingAlert | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { emergencyContacts } = useSafetyStore();
  const { activeInstallation, user } = useAuth();
  const { data: members } = useInstallationMembers(activeInstallation?.id);

  const primaryContact = emergencyContacts[0]?.phone || '193';

  const getBatteryLevel = async () => {
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        return `${Math.round(battery.level * 100)}%`;
      }
    } catch (e) {
      console.warn('Could not get battery level:', e);
    }
    return 'N/A';
  };

  const handleSOS = async (type: AlertType, message: string) => {
    setIsSending(true);

    let location: { lat: number; lng: number } | undefined = undefined;
    const batteryLevel = await getBatteryLevel();

    try {
      const position = await new Promise<AppGeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          }),
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
      location = {
        lat: position.latitude,
        lng: position.longitude
      };
    } catch (e) {
      console.warn('Could not get geolocation for SOS:', e);
    }

    try {
      await createAlert.mutateAsync({
        taskId,
        userId,
        type,
        message: `${message} (Bateria: ${batteryLevel})`,
        location: location as any // Use any if the hook expects the DOM GeolocationPosition type but we need our custom one
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
            `Mensagem: ${message} (Bateria: ${batteryLevel}). Toque para ver a localização.`,
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
      setMode('menu');
      toast.success('Alerta de SOS enviado!');
    } catch (e) {
      console.error('Erro ao enviar SOS:', e);
      toast.error('Falha ao enviar alerta de SOS.');
    } finally {
      setIsSending(false);
      setPendingAlert(null);
    }
  };

  const startCountdown = (alert: PendingAlert) => {
    setPendingAlert(alert);
    setCountdown(5);
    setMode('countdown');
  };

  const cancelCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPendingAlert(null);
    setMode('menu');
  };

  useEffect(() => {
    if (mode === 'countdown' && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      }, 1000);
    } else if (mode === 'countdown' && countdown === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pendingAlert) {
        if (pendingAlert.isCall) {
          window.location.href = `tel:${primaryContact}`;
          setIsOpen(false);
          setMode('menu');
          setPendingAlert(null);
        } else {
          handleSOS(pendingAlert.type, pendingAlert.message);
        }
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, countdown, pendingAlert, primaryContact]);

  const resetAndClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        setMode('menu');
        setPendingAlert(null);
      }, 300);
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
        mode === 'wizard' ? "max-h-[90vh] overflow-y-auto" : "",
        mode === 'countdown' ? "bg-red-600 border-none text-white overflow-hidden" : ""
      )}>
        {mode === 'countdown' ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              <div className="relative h-32 w-32 rounded-full border-8 border-white flex items-center justify-center">
                <span className="text-6xl font-black">{countdown}</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                Enviando pedido de socorro em...
              </h2>
              <p className="text-white/80 font-medium">
                {pendingAlert?.isCall ? 'Iniciando chamada de emergência' : pendingAlert?.message}
              </p>
            </div>

            <Button
              variant="ghost"
              size="lg"
              onClick={cancelCountdown}
              className="w-full h-16 text-xl font-bold border-2 border-white hover:bg-white hover:text-red-600 transition-colors"
            >
              <X className="mr-2 h-6 w-6" />
              CANCELAR
            </Button>
          </div>
        ) : mode === 'menu' ? (
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
                className="h-20 text-xl bg-red-600 hover:bg-red-700 font-black shadow-lg shadow-red-200"
                onClick={() => startCountdown({ type: 'SOS', message: 'Chamada de Emergência', isCall: true })}
              >
                <Phone className="mr-3 h-8 w-8 animate-bounce" />
                LIGAR EMERGÊNCIA
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
                  onClick={() => startCountdown({ type: 'SOS', message: 'Emergência Médica / Acidente' })}
                  disabled={isSending}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  ACIDENTE
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 border-orange-200 hover:bg-orange-50 text-orange-700 font-semibold"
                  onClick={() => startCountdown({ type: 'SAFETY_ISSUE', message: 'Risco iminente de segurança' })}
                  disabled={isSending}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  RISCO SEG.
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold col-span-2"
                  onClick={() => startCountdown({ type: 'HELP', message: 'Solicitação de apoio urgente da equipe' })}
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
