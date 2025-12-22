/**
 * Clinometer Modal - Fullscreen Tree Height Measurement
 * Based on original clinometer.js UI
 */

import { useEffect, useRef, useState } from 'react';
import { useClinometer } from '../../hooks/useClinometer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, CheckCircle, RotateCcw } from 'lucide-react';

interface ClinometerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHeightMeasured: (height: number) => void;
}

export function ClinometerModal({
    isOpen,
    onClose,
    onHeightMeasured
}: ClinometerModalProps) {
    const {
        currentAngle,
        angleBase,
        angleTop,
        distance,
        calculatedHeight,
        cameraStream,
        error,
        step,
        startMeasurement,
        stopMeasurement,
        setDistance,
        captureBase,
        captureTop,
        reset
    } = useClinometer();

    const videoRef = useRef<HTMLVideoElement>(null);
    const [distanceInput, setDistanceInput] = useState('10');

    // Setup video stream
    useEffect(() => {
        if (videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.play().catch(() => { });
        }
    }, [cameraStream]);

    // Auto-start when modal opens
    useEffect(() => {
        if (isOpen) {
            startMeasurement();
        }
        return () => {
            stopMeasurement();
        };
    }, [isOpen, startMeasurement, stopMeasurement]);

    const handleClose = () => {
        stopMeasurement();
        onClose();
    };

    const handleStartMeasure = () => {
        const dist = parseFloat(distanceInput);
        if (setDistance(dist)) {
            // Success, moved to base step
        }
    };

    const handleSaveHeight = () => {
        if (calculatedHeight !== null) {
            onHeightMeasured(calculatedHeight);
            handleClose();
        }
    };

    if (!isOpen) return null;

    const angleColor = Math.abs(currentAngle) > 85 ? '#ff5252' : '#00e676';

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col h-[100dvh]">
            {/* Video Feed - Takes available space */}
            <div className="relative flex-1 overflow-hidden min-h-0">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                />

                {/* Crosshair Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                        <div className="w-0.5 h-16 sm:h-24 bg-white opacity-70" style={{ marginLeft: 'auto', marginRight: 'auto' }} />
                        <div className="w-16 sm:w-24 h-0.5 bg-white opacity-70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* Angle Display */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div
                        className="text-4xl sm:text-6xl font-bold text-center px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm"
                        style={{ color: angleColor }}
                    >
                        {Math.abs(currentAngle).toFixed(1)}°
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Error Message */}
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/90 text-white rounded-lg text-center text-sm">
                        {error}
                    </div>
                )}
            </div>

            {/* Control Panel - Compact & Flexible */}
            <div className="bg-gray-900 text-white p-3 shrink-0 safe-area-pb">
                {/* Step: Distance */}
                {step === 'distance' && (
                    <div className="space-y-3">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-1">Distância (m)</h3>
                            <div className="flex gap-2 max-w-[200px] mx-auto">
                                <Input
                                    type="number"
                                    value={distanceInput}
                                    onChange={(e) => setDistanceInput(e.target.value)}
                                    placeholder="0"
                                    className="bg-gray-800 border-gray-700 text-white text-xl text-center h-12"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleStartMeasure}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                        >
                            Iniciar
                        </Button>
                    </div>
                )}

                {/* Step: Base */}
                {step === 'base' && (
                    <div className="space-y-3">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-1">1. Base do Tronco</h3>
                            <p className="text-xs text-gray-400">Distância: {distance}m</p>
                        </div>

                        <Button
                            onClick={captureBase}
                            className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg"
                        >
                            Capturar Base
                        </Button>
                    </div>
                )}

                {/* Step: Top */}
                {step === 'top' && (
                    <div className="space-y-3">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-1">2. Topo da Copa</h3>
                            <p className="text-xs text-gray-400">
                                Base: {Math.abs(angleBase!).toFixed(1)}° | Dist: {distance}m
                            </p>
                        </div>

                        <Button
                            onClick={captureTop}
                            className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg"
                        >
                            Capturar Topo
                        </Button>
                    </div>
                )}

                {/* Step: Result */}
                {step === 'result' && calculatedHeight !== null && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-center flex-1">
                                <span className="text-sm text-gray-400 block">Altura</span>
                                <span className="text-4xl font-bold text-green-500 leading-none">
                                    {calculatedHeight.toFixed(1)}m
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 space-y-1 bg-gray-800 p-2 rounded flex-1">
                                <div className="flex justify-between"><span>Dist:</span> <span>{distance}m</span></div>
                                <div className="flex justify-between"><span>Base:</span> <span>{Math.abs(angleBase!).toFixed(1)}°</span></div>
                                <div className="flex justify-between"><span>Topo:</span> <span>{Math.abs(angleTop!).toFixed(1)}°</span></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={reset}
                                variant="outline"
                                className="bg-gray-800 border-gray-700 h-12"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" /> Refazer
                            </Button>
                            <Button
                                onClick={handleSaveHeight}
                                className="bg-green-600 h-12"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" /> Salvar
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
