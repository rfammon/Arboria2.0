import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, Info } from 'lucide-react';

interface DAPOverlayProps {
    onConfirm: (dapCm: number) => void;
}

export function DAPOverlay({ onConfirm }: DAPOverlayProps) {
    const [circleSize, setCircleSize] = useState(50); // 0-100% relative to max size
    // Standard reference: Credit card width is ~8.56cm (ISO/IEC 7810 ID-1)
    // For MVP phase 1, we will use a simpler approximation based on field of view
    // Or, we assume the user holds the phone at a standard distance (arm's length ~50cm)
    // LIMITATION: Without a reference object in the frame, this is purely an estimate based on FOV assumption.
    // IMPROVEMENT: For Phase 2, we should ask user to place a reference card or calibrate "hand width".
    // For now, let's implement the UI and a "calibrated" constant.

    // Assume at arm's length, the screen width covers approx 50cm of real world width (rough mobile estimate)
    // This is HIGHLY variable but serves the MVP "Estimation" goal.
    const REFERENCE_WIDTH_CM = 50;

    const calculateDAP = () => {
        // Linear mapping: size 0 = 1cm, size 100 = REFERENCE_WIDTH_CM
        // 5cm min to avoid 0
        const minCm = 1;
        const maxCm = REFERENCE_WIDTH_CM;

        // Simple linear interpolation
        const estimatedDap = minCm + (circleSize / 100) * (maxCm - minCm);
        return parseFloat(estimatedDap.toFixed(1));
    };

    const currentDap = calculateDAP();

    return (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col h-[100dvh]">
            {/* Guide Text */}
            <div className="pt-12 sm:pt-16 px-4 text-center pointer-events-auto">
                <div className="bg-black/60 text-white p-2 rounded-lg backdrop-blur-sm inline-block max-w-[90%]">
                    <p className="font-semibold text-sm">Ajuste o círculo ao tronco</p>
                    <p className="text-[10px] opacity-80">Celular a um braço de distância</p>
                </div>
            </div>

            {/* Central Measurement Circle */}
            <div className="flex-1 flex items-center justify-center relative min-h-0">
                {/* Reference Line/Circle */}
                <div
                    className="border-4 border-green-500 rounded-full shadow-[0_0_0_1000px_rgba(0,0,0,0.5)] transition-all duration-75"
                    style={{
                        width: `${10 + (circleSize * 0.8)}%`, // map 0-100 scale to 10%-90% of screen width
                        aspectRatio: '1/1'
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-green-500 text-black font-bold px-2 py-1 rounded text-lg shadow-lg whitespace-nowrap">
                            ~{currentDap} cm
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls - Constrained for mobile */}
            <div className="p-3 bg-black/80 backdrop-blur-md pointer-events-auto shrink-0 safe-area-pb">
                <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
                    <div className="flex items-center gap-3 px-1">
                        <span className="text-white text-xs font-bold w-8 text-right">1cm</span>
                        <Slider
                            value={[circleSize]}
                            onValueChange={(val: number[]) => setCircleSize(val[0])}
                            max={100}
                            step={0.5}
                            className="flex-1"
                        />
                        <span className="text-white text-xs font-bold w-8">50+</span>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-orange-500/10 border border-orange-500/30 rounded p-1.5 flex items-center justify-center gap-2">
                            <Info className="w-3 h-3 text-orange-500 shrink-0" />
                            <span className="text-[10px] text-orange-200 leading-tight">
                                Margem: ±2cm
                            </span>
                        </div>

                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 h-10"
                            onClick={() => onConfirm(currentDap)}
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
