import React, { useState, useRef } from 'react';
import { Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { EvidenceStage, TaskEvidence } from '@/types/execution';
import { useTaskMutations } from '@/hooks/useExecution';
import { toast } from 'sonner';

interface TaskEvidenceUploadProps {
    taskId: string;
    stage: EvidenceStage;
    existingEvidence?: TaskEvidence[];
    onUploadComplete?: () => void;
    readOnly?: boolean;
}

const STAGE_LABELS: Record<EvidenceStage, string> = {
    none: 'Nenhuma',
    before: 'Antes (Início)',
    during: 'Durante',
    during_1: 'Durante (Etapa 1)',
    during_2: 'Durante (Etapa 2)',
    after: 'Depois (Final)',
    completed: 'Concluído (Validado)',
    completion: 'Conclusão'
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
    before: 'Tire uma foto clara da árvore antes de iniciar qualquer intervenção.',
    during: 'Registre o andamento do trabalho.',
    after: 'Foto final mostrando o serviço concluído e a limpeza do local.',
    completion: 'Foto de validação final.'
};

export function TaskEvidenceUpload({
    taskId,
    stage,
    existingEvidence = [],
    onUploadComplete,
    readOnly = false
}: TaskEvidenceUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addEvidence } = useTaskMutations();

    // Filter evidence for this stage
    const currentStageEvidence = existingEvidence.filter(e => e.stage === stage);

    // Normalize stage for display (combine during_1 and during_2 into "during")
    const displayStage = stage === 'during_1' || stage === 'during_2' ? 'during' : stage;

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('A imagem deve ter no máximo 10MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // 1. Convert to base64 for preview/upload (In real app, upload to storage bucket)
            // For MVP/Proto, we might just store base64 or mock URL if no storage bucket handy
            // Assuming we have storage bucket or similar mechanism. 
            // For this implementation step, I'll assume we get a URL back from a "uploadService" mock
            // dependent on the environment. 

            // Simulating upload
            const reader = new FileReader();
            reader.onload = async (e) => {
                setUploadProgress(50);
                const base64 = e.target?.result as string;

                // Mock upload delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setUploadProgress(80);

                // Ideally call a storage service here. 
                // For now, we save the base64/URL directly via the mutation
                // Note: DB column is text, likely URL. Storing base64 might be heavy but ok for small MVP.
                // Better: Use a placeholder URL if we don't have real storage connected yet.
                const mockUrl = base64; // In prod, this would be a Supabase Storage URL

                addEvidence.mutate({
                    taskId,
                    stage,
                    photoUrl: mockUrl,
                    metadata: {
                        filename: file.name,
                        size: file.size,
                        type: file.type,
                        originalDate: new Date().toISOString()
                    }
                }, {
                    onSuccess: () => {
                        setUploadProgress(100);
                        toast.success('Foto enviada com sucesso!');
                        setIsUploading(false);
                        if (onUploadComplete) onUploadComplete();
                    },
                    onError: () => {
                        setIsUploading(false);
                    }
                });
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error(error);
            toast.error('Erro ao processar imagem');
            setIsUploading(false);
        }
    };

    const triggerCamera = () => {
        // Check if mobile/capacitor
        // If web, trigger file input with capture
        fileInputRef.current?.click();
    };

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        {STAGE_LABELS[stage] || stage}
                        {currentStageEvidence.length > 0 && <Check className="text-green-500 w-5 h-5" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {STAGE_DESCRIPTIONS[displayStage] || 'Adicione uma foto para esta etapa.'}
                    </p>
                </div>
            </div>

            {/* Existing Evidence List */}
            {currentStageEvidence.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {currentStageEvidence.map((evidence) => (
                        <div key={evidence.id} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
                            <img
                                src={evidence.photo_url}
                                alt="Evidência"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 truncate">
                                {new Date(evidence.captured_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload UI */}
            {!readOnly && (
                <div className="space-y-3">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        disabled={isUploading}
                    />

                    <Button
                        variant="outline"
                        className="w-full h-24 border-dashed border-2 flex flex-col gap-2 hover:bg-muted/50"
                        onClick={triggerCamera}
                        disabled={isUploading}
                    >
                        <Camera className="w-8 h-8 text-muted-foreground" />
                        <span className="text-muted-foreground">Capturar Foto</span>
                    </Button>

                    {isUploading && (
                        <div className="space-y-1">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">Enviando... {uploadProgress}%</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
