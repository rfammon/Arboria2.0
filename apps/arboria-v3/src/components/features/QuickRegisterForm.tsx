import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, X, Loader2, Trees, Check, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useTreeMutations } from '../../hooks/useTreeMutations';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { TRAQChecklistModal } from '../traq/TRAQChecklistModal';
import { useTRAQCriteria } from '../../hooks/useTRAQCriteria';
import type { TRAQAssessment } from '../../types/traq';
import { RISK_PROFILES } from '../../lib/traq/traqLogic';

interface QuickRegisterFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    refetchTrees?: () => void;
}

type Stage = 'camera' | 'form' | 'saving';

export function QuickRegisterForm({ isOpen, onClose, onSuccess }: QuickRegisterFormProps) {
    const [stage, setStage] = useState<Stage>('camera');
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    // Form Data
    const [species, setSpecies] = useState('');
    const [dap, setDap] = useState('');
    const [height, setHeight] = useState('');
    const [observations, setObservations] = useState('');

    // TRAQ Data
    const [traqAssessment, setTraqAssessment] = useState<TRAQAssessment | null>(null);
    const [isTraqOpen, setIsTraqOpen] = useState(false);
    const { criteria } = useTRAQCriteria();

    const [isSaving, setIsSaving] = useState(false);
    const [treeCount, setTreeCount] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const { location: gpsLocation, state: gpsState } = useUserLocation();
    const gpsLoading = gpsState === 'loading';
    const { createTree } = useTreeMutations();
    const { activeInstallation, user } = useAuth();

    // Start camera when modal opens
    useEffect(() => {
        if (isOpen && stage === 'camera') {
            startCamera();
        }
        return () => stopCamera();
    }, [isOpen, stage]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('[QuickRegister] Camera error:', error);
            toast.error('Erro ao acessar câmera');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedPhoto(dataUrl);

            // Convert to File
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `tree_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setPhotoFile(file);
                }
            }, 'image/jpeg', 0.85);
        }

        stopCamera();
        setStage('form');
    };

    const handleTraqComplete = (assessment: TRAQAssessment) => {
        setTraqAssessment(assessment);
        setIsTraqOpen(false);
        toast.success('Avaliação de risco registrada!');
    };

    const handleSave = async () => {
        if (!activeInstallation?.id || !user?.id) {
            toast.error('Instalação ou usuário não definido');
            return;
        }

        if (!species) {
            toast.error('Informe a espécie');
            return;
        }

        if (!traqAssessment) {
            toast.error('Realize a avaliação de risco');
            return;
        }

        setIsSaving(true);
        setStage('saving');

        try {
            const treeId = uuid();
            const now = new Date().toISOString();

            // 1. Create tree record with TRAQ data
            await createTree.mutateAsync({
                id: treeId,
                instalacao_id: activeInstallation.id,
                especie: species,
                data: now.split('T')[0],
                latitude: gpsLocation?.latitude || null,
                longitude: gpsLocation?.longitude || null,
                dap: dap ? parseFloat(dap) : null,
                altura: height ? parseFloat(height) : null,
                observacoes: observations,

                // TRAQ Fields
                failure_prob: traqAssessment.failureProb,
                impact_prob: traqAssessment.impactProb,
                target_category: traqAssessment.targetCategory,
                residual_risk: traqAssessment.residualRisk,
                risk_factors: traqAssessment.riskFactors, // Sending raw array (0|1)[] - Supabase should handle integer array
                pontuacao: traqAssessment.totalScore,

                created_by: user.id,
            });

            // 2. Upload photo if captured
            if (photoFile) {
                const storagePath = `${activeInstallation.id}/${treeId}/${photoFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('tree-photos')
                    .upload(storagePath, photoFile);

                if (!uploadError) {
                    // Create photo record
                    await supabase.from('tree_photos').insert({
                        tree_id: treeId,
                        instalacao_id: activeInstallation.id,
                        storage_path: storagePath,
                        filename: photoFile.name,
                        file_size: photoFile.size,
                        mime_type: 'image/jpeg',
                        uploaded_by: user.id,
                    });
                }
            }

            setTreeCount(prev => prev + 1);
            toast.success(`Árvore #${treeCount + 1} cadastrada com TRAQ completo!`, { duration: 2000 });

            // Reset for next tree
            resetForm();
            onSuccess?.();

        } catch (error) {
            console.error('[QuickRegister] Save error:', error);
            toast.error('Erro ao salvar árvore');
            setStage('form');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setCapturedPhoto(null);
        setPhotoFile(null);
        setSpecies('');
        setDap('');
        setHeight('');
        setObservations('');
        setTraqAssessment(null);
        setStage('camera');
        startCamera();
    };

    const handleClose = () => {
        stopCamera();
        setTreeCount(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col h-[100dvh]">
            {/* Header */}
            <div className="flex justify-between items-center p-3 bg-black/80 text-white z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <Trees className="w-5 h-5 text-primary" />
                    <div>
                        <h2 className="font-bold text-base">Cadastro Rápido</h2>
                        <p className="text-[10px] text-white/60 leading-none">
                            {gpsLoading ? (
                                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> GPS...</span>
                            ) : gpsLocation ? (
                                <span className="flex items-center gap-1 text-green-400"><MapPin className="w-3 h-3" /> GPS OK</span>
                            ) : (
                                <span className="text-orange-400">Sem GPS</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {treeCount > 0 && (
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                            {treeCount}
                        </span>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20 h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* Stage: Camera */}
                {stage === 'camera' && (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <div className="flex-1 relative bg-black overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Crosshair */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 border-2 border-white/50 rounded-lg" />
                            </div>
                        </div>

                        {/* Capture Button */}
                        <div className="p-6 bg-black/90 flex justify-center safe-area-pb shrink-0">
                            <button
                                onClick={handleCapture}
                                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <div className="w-16 h-16 rounded-full bg-white" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Stage: Form */}
                {stage === 'form' && capturedPhoto && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex-1 flex flex-col bg-background h-full"
                    >
                        {/* Compact Photo Preview Header */}
                        <div className="h-24 relative overflow-hidden shrink-0">
                            <img src={capturedPhoto} alt="Preview" className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
                            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-end">
                                <h3 className="text-lg font-bold text-white">Nova Árvore</h3>
                                <button
                                    onClick={resetForm}
                                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm"
                                >
                                    <Camera className="w-3 h-3" /> Refazer Foto
                                </button>
                            </div>
                        </div>

                        {/* Form Fields - Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5">
                            {/* Species */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Espécie *</label>
                                <Input
                                    value={species}
                                    onChange={(e) => setSpecies(e.target.value)}
                                    placeholder="Nome da espécie"
                                    className="h-12 text-lg"
                                    autoFocus
                                />
                            </div>

                            {/* CAP & DAP Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">CAP (cm)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        onChange={(e) => {
                                            const capValue = parseFloat(e.target.value);
                                            if (!isNaN(capValue)) {
                                                const calculatedDap = (capValue / Math.PI).toFixed(1);
                                                setDap(calculatedDap);
                                            }
                                        }}
                                        className="h-12 text-lg text-center"
                                        inputMode="decimal"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">DAP (cm)</label>
                                    <Input
                                        type="number"
                                        value={dap}
                                        onChange={(e) => setDap(e.target.value)}
                                        placeholder="0.0"
                                        className="h-12 text-lg text-center"
                                        inputMode="decimal"
                                    />
                                </div>
                            </div>

                            {/* Height Row */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Altura (m)</label>
                                    <Input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="0.0"
                                        className="h-12 text-lg text-center"
                                        inputMode="decimal"
                                    />
                                </div>
                            </div>

                            {/* Full TRAQ Assessment Button */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
                                    <span>Avaliação de Risco (TRAQ) *</span>
                                    {traqAssessment && (
                                        <span
                                            className="font-bold text-xs px-2 py-0.5 rounded"
                                            style={{
                                                backgroundColor: RISK_PROFILES[traqAssessment.initialRisk as keyof typeof RISK_PROFILES].bgColor,
                                                color: RISK_PROFILES[traqAssessment.initialRisk as keyof typeof RISK_PROFILES].color
                                            }}
                                        >
                                            Risco {traqAssessment.initialRisk}
                                        </span>
                                    )}
                                </label>

                                {traqAssessment ? (
                                    <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <ClipboardCheck className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Avaliação Concluída</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {traqAssessment.riskFactors.filter(f => f === 1).length} fatores identificados
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setIsTraqOpen(true)}>
                                            Editar
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 border-dashed border-2 flex items-center gap-2 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"
                                        onClick={() => setIsTraqOpen(true)}
                                    >
                                        <AlertTriangle className="w-5 h-5" />
                                        Realizar Avaliação TRAQ
                                    </Button>
                                )}
                            </div>

                            {/* Observations */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Observações</label>
                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    placeholder="Estado fitossanitário, interferências..."
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                                />
                            </div>

                            {/* Save Button - Now inside scroll to avoid keyboard overlap */}
                            <div className="p-4 safe-area-pb">
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg font-bold shadow-lg"
                                    onClick={handleSave}
                                    disabled={isSaving || !traqAssessment}
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Salvar Árvore
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stage: Saving */}
                {stage === 'saving' && (
                    <motion.div
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center bg-background"
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-semibold">Salvando...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TRAQ Modal */}
            <TRAQChecklistModal
                isOpen={isTraqOpen}
                onClose={() => setIsTraqOpen(false)}
                onComplete={handleTraqComplete}
                criteria={criteria}
            />
        </div>
    );
}
