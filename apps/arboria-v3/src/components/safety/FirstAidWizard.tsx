import { useState } from 'react';
import { FIRST_AID_PROTOCOLS } from '@/data/firstAidProtocols';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface FirstAidWizardProps {
  onBack: () => void;
}

type Step = 'assessment' | 'scenario' | 'guidance';

export function FirstAidWizard({ onBack }: FirstAidWizardProps) {
  const [step, setStep] = useState<Step>('assessment');
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);

  const selectedProtocol = FIRST_AID_PROTOCOLS.find(p => p.id === selectedProtocolId);

  const handleLigar193 = () => {
    window.location.href = 'tel:193';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-2">
        <Button variant="ghost" size="sm" onClick={step === 'assessment' ? onBack : () => setStep(step === 'guidance' ? 'scenario' : 'assessment')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-600 animate-pulse"
          onClick={handleLigar193}
        >
          <Phone className="mr-2 h-4 w-4" />
          LIGAR 193
        </Button>
      </div>

      {step === 'assessment' && (
        <div className="space-y-4 py-4 text-center">
          <h2 className="text-xl font-bold">Avaliação Inicial</h2>
          <p className="text-muted-foreground italic">Verifique o estado da vítima antes de prosseguir.</p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="h-32 flex-col gap-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
              onClick={() => setStep('scenario')}
            >
              <CheckCircle2 className="h-8 w-8" />
              <span>Está Consciente</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex-col gap-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
              onClick={() => {
                setStep('scenario');
                // In a real app we might prioritize protocols for unconscious victims
              }}
            >
              <XCircle className="h-8 w-8" />
              <span>Inconsciente</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Se a vítima não respira, inicie RCP imediatamente se souber.
          </p>
        </div>
      )}

      {step === 'scenario' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Qual a situação?</h2>
          <div className="grid grid-cols-2 gap-2">
            {FIRST_AID_PROTOCOLS.map((protocol) => (
              <Button
                key={protocol.id}
                variant="outline"
                className="h-20 text-xs flex-col gap-1 text-center whitespace-normal"
                onClick={() => {
                  setSelectedProtocolId(protocol.id);
                  setStep('guidance');
                }}
              >
                {protocol.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 'guidance' && selectedProtocol && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-orange-700 font-bold">
              <AlertTriangle className="h-5 w-5" />
              <h3>{selectedProtocol.label}</h3>
            </div>

            <div className="space-y-3">
              {selectedProtocol.steps.map((s, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-200 text-xs font-bold text-orange-700">
                    {i + 1}
                  </span>
                  <p>{s}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md bg-red-50 p-3 text-xs border border-red-100">
              <p className="font-bold text-red-700 mb-1">AVISO IMPORTANTE:</p>
              <p className="text-red-600">{selectedProtocol.warning}</p>
            </div>

            <Button
              className="w-full mt-4 bg-red-600 hover:bg-red-700 font-bold"
              onClick={handleLigar193}
            >
              <Phone className="mr-2 h-4 w-4" />
              NÃO SEI O QUE FAZER - LIGAR 193
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-auto pt-4 border-t text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          Protocolos de Primeiros Socorros - Arboria V3
        </p>
      </div>
    </div>
  );
}
