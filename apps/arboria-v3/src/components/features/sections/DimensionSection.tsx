import { useState } from 'react';
import { Camera, Ruler } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { ClinometerModal } from '../../sensors/ClinometerModal';
import { DAPCamera } from '../dap/DAPCamera';
import { DAPOverlay } from '../dap/DAPOverlay';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [calculatedDap, setCalculatedDap] = useState<number | null>(null);

    const handleCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const capValue = parseFloat(e.target.value);
        if (!isNaN(capValue) && capValue > 0) {
            const dapValue = parseFloat((capValue / Math.PI).toFixed(1));
            setCalculatedDap(dapValue);
            setValue('dap', dapValue);
        } else {
            setCalculatedDap(null);
        }
    };

    return (
        <div className="space-y-6 pt-6 border-t border-border/50">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Ruler className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Dimensões
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Medidas dendrométricas da árvore
                    </p>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-muted/20 p-5 rounded-xl border border-border/50 space-y-5">
                {/* CAP and DAP Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        {/* Standardize label structure to match DAP label (flex items-center) for vertical alignment */}
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center h-5">
                            CAP (cm)
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                onChange={handleCapChange}
                                className="flex-1 h-12 text-base text-center font-medium"
                            />
                            {/* Use invisible ghost button to guarantee exact same width/height as DAP's camera button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled
                                className="h-12 w-12 shrink-0 opacity-0 pointer-events-none"
                            >
                                <Camera className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                            Circunferência
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center justify-between h-5">
                            <span>DAP (cm)</span>
                            <AnimatePresence>
                                {calculatedDap && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="text-[9px] bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded"
                                    >
                                        Auto
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                step="0.1"
                                {...register('dap')}
                                className="flex-1 h-12 text-base text-center font-medium"
                                placeholder="0.0"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowDAPEstimator(true)}
                                title="Estimar DAP com câmera"
                                className="h-12 w-12 shrink-0"
                            >
                                <Camera className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                            Diâmetro
                        </p>
                    </div>
                </div>

                {/* Altura */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Altura Total (m)
                    </label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            step="0.1"
                            {...register('altura')}
                            className="flex-1 h-12 text-base text-center font-medium"
                            placeholder="0.0"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowClinometer(true)}
                            title="Medir altura com clinômetro"
                            className="h-12 w-12 shrink-0"
                        >
                            <Camera className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Use o clinômetro para medição precisa
                    </p>
                </div>
            </div>

            {/* Modals */}
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
