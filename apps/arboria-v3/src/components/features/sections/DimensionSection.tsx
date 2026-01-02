import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { ClinometerModal } from '../../sensors/ClinometerModal';
import { DAPCamera } from '../dap/DAPCamera';
import { DAPOverlay } from '../dap/DAPOverlay';
import { toast } from 'sonner';

interface DimensionSectionProps {
    register: any;
    setValue: any;
}

export function DimensionSection({
    register,
    setValue
}: DimensionSectionProps) {
    const [showClinometer, setShowClinometer] = useState(false);
    const [showDAPEstimator, setShowDAPEstimator] = useState(false);

    return (
        <div className="space-y-4">
            {/* CAP and DAP Selection */}
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium leading-none">CAP (cm)</label>
                    <Input
                        type="number"
                        step="0.1"
                        placeholder="Circunferência"
                        onChange={(e) => {
                            const capValue = parseFloat(e.target.value);
                            if (!isNaN(capValue)) {
                                const calculatedDap = (capValue / Math.PI).toFixed(1);
                                setValue('dap', parseFloat(calculatedDap));
                            }
                        }}
                        className="h-10"
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium leading-none">DAP (cm)</label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            step="0.1"
                            {...register('dap')}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDAPEstimator(true)}
                            title="Estimar DAP com câmera"
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Altura */}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Altura (m)</label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        step="0.1"
                        {...register('altura')}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowClinometer(true)}
                        title="Medir altura com clinômetro"
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Modativos (Modals) */}
            {showClinometer && (
                <ClinometerModal
                    isOpen={showClinometer}
                    onClose={() => setShowClinometer(false)}
                    onHeightMeasured={(height: number) => {
                        setValue('altura', height);
                        setShowClinometer(false);
                    }}
                />
            )}

            <DAPCamera
                isOpen={showDAPEstimator}
                onClose={() => setShowDAPEstimator(false)}
                onCapture={() => { }}
            >
                <DAPOverlay
                    onConfirm={(dap) => {
                        setValue('dap', dap);
                        setShowDAPEstimator(false);
                        toast.success('DAP estimado com sucesso!');
                    }}
                />
            </DAPCamera>
        </div>
    );
}
