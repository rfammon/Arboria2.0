import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { utmToLatLon } from '../../lib/coordinateUtils';
import { cn } from '../../lib/utils';

import { Ruler, Trees, AlertTriangle, Calendar, Image, Edit, FileText, ClipboardList, Upload, ArrowLeft, Expand, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTRAQCriteria } from '../../hooks/useTRAQCriteria';
import { Button } from '../ui/button';
import { FieldAction } from '../common/FieldAction';
import { PhotoViewer } from './photos/PhotoViewer';
import TreeMiniMap from './TreeMiniMap';
import { useTrees } from '../../hooks/useTrees';
import { useTreePhotos } from '../../hooks/useTreePhotos';
import { usePhotoUpload } from '../../hooks/usePhotoUpload';
import { useTreeMutations } from '../../hooks/useTreeMutations';
import { usePresence } from '../../hooks/usePresence';
import { PresenceBadge } from '../common/PresenceBadge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

interface TreeDetailContentProps {
    treeId: string;
    onClose?: () => void;
    isBlade?: boolean;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function TreeDetailContent({ treeId, onClose, isBlade = false }: TreeDetailContentProps) {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const { criteria } = useTRAQCriteria();
    const { presences } = usePresence(treeId);
    const usersViewing = presences[treeId] || [];
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { deleteTree } = useTreeMutations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: trees, isLoading: treesLoading } = useTrees();
    const { data: photos = [] } = useTreePhotos(treeId);
    const tree = trees?.find(t => t.id === treeId);

    const { uploadPhoto, isUploading, uploadProgress } = usePhotoUpload(
        treeId,
        tree?.instalacao_id || ''
    );

    const handleDelete = async () => {
        if (!treeId) return;
        await deleteTree.mutateAsync(treeId);
        if (onClose) onClose();
        navigate('/inventory');
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadPhoto(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (treesLoading) {
        return <div className="p-8 text-center animate-pulse text-muted-foreground">Carregando detalhes...</div>;
    }

    if (!tree) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 font-inter">
                <Trees className="w-12 h-12 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">Árvore não encontrada</p>
                {onClose && <Button onClick={onClose}>Voltar</Button>}
            </div>
        );
    }

    const getRiskColor = (score?: number) => {
        if (!score) return 'text-muted-foreground';
        if (score > 8) return 'text-destructive';
        if (score > 5) return 'text-orange-500 dark:text-orange-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getRiskLabel = (score?: number) => {
        if (!score) return 'Não avaliado';
        if (score > 8) return 'Risco Alto';
        if (score > 5) return 'Risco Médio';
        return 'Risco Baixo';
    };

    const openPhotoViewer = (index: number) => {
        setViewerInitialIndex(index);
        setViewerOpen(true);
    };

    const getDisplayCoordinates = () => {
        if (!tree) return null;
        if (tree.latitude && tree.longitude) {
            return { latitude: tree.latitude, longitude: tree.longitude };
        }
        // Fallback to UTM conversion
        const t = tree as any;
        if (t.utm_e && t.utm_n && t.utm_zone) {
            const match = t.utm_zone.match(/(\d+)([A-Z]?)/);
            if (match) {
                const zoneNum = parseInt(match[1]);
                const zoneLetter = match[2] || 'K'; // Default to K (SP/South) if missing
                const converted = utmToLatLon(
                    Number(t.utm_e),
                    Number(t.utm_n),
                    zoneNum,
                    zoneLetter
                );
                if (converted) return converted;
            }
        }
        return null;
    };

    const coords = getDisplayCoordinates();

    return (
        <div className={`flex flex-col h-full bg-background font-inter ${isBlade ? 'overflow-hidden' : ''}`}>
            {/* Header / Title */}
            <div className="px-6 py-4 border-b border-border bg-card/50 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-foreground">
                            {tree.especie || 'Espécie Desconhecida'}
                        </h1>
                        <PresenceBadge users={usersViewing} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                        UUID: {tree.id.slice(0, 8)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Maximize Button - Only show if in Drawer/Blade (has onClose) */}
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/inventory/${tree.id}`)}
                            title="Ver em Tela Cheia"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Expand className="w-5 h-5" />
                        </Button>
                    )}
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="status" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b border-border bg-muted/30">
                    <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-6">
                        <TabsTrigger
                            value="status"
                            className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 font-semibold text-xs uppercase tracking-wider"
                        >
                            Status
                        </TabsTrigger>
                        {/* Hidden Tabs explicitly requested by user */}
                        {/* <TabsTrigger value="history">Histórico</TabsTrigger> */}
                        {/* <TabsTrigger value="trends">Tendências</TabsTrigger> */}
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <TabsContent value="status" className="p-6 m-0 space-y-8 outline-none animate-in fade-in-50 duration-300">
                        {/* Actions Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {hasPermission('edit_trees') && (
                                <FieldAction
                                    className={cn(
                                        "w-full justify-start shrink-0",
                                        isBlade ? "h-10 text-xs" : "h-14 text-sm"
                                    )}
                                    isPrimary
                                    onClick={() => navigate('/inventory', { state: { editTreeId: tree.id } })}
                                >
                                    <Edit className={cn("mr-2 shrink-0", isBlade ? "w-4 h-4" : "w-5 h-5")} />
                                    Editar
                                </FieldAction>
                            )}

                            <FieldAction
                                className={cn(
                                    "w-full justify-start shrink-0",
                                    isBlade ? "h-10 text-xs" : "h-14 text-sm"
                                )}
                                variant="outline"
                                onClick={() => navigate(`/plans?treeId=${tree.id}`)}
                            >
                                <ClipboardList className={cn("mr-2 shrink-0", isBlade ? "w-4 h-4" : "w-5 h-5")} />
                                Plano
                            </FieldAction>

                            {hasPermission('manage_installation') && (
                                <FieldAction
                                    className={cn(
                                        "w-full justify-start shrink-0 col-span-2",
                                        isBlade ? "h-10 text-xs" : "h-14 text-sm"
                                    )}
                                    variant="outline"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className={cn("mr-2 shrink-0 text-destructive", isBlade ? "w-4 h-4" : "w-5 h-5")} />
                                    Excluir Árvore
                                </FieldAction>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-4 space-y-4">
                            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider opacity-60">Informações Básicas</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2 italic">
                                        <Calendar className="w-4 h-4" /> Data
                                    </span>
                                    <span className="font-medium">
                                        {tree.data ? format(new Date(tree.data), 'dd/MM/yyyy') : '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2 italic">
                                        <Ruler className="w-4 h-4" /> DAP
                                    </span>
                                    <span className="font-medium">{tree.dap ? `${tree.dap} cm` : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2 italic">
                                        <Trees className="w-4 h-4" /> Altura
                                    </span>
                                    <span className="font-medium">{tree.altura ? `${tree.altura} m` : '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Risk Analysis */}
                        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-4 space-y-4">
                            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider opacity-60 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Análise de Risco
                            </h2>

                            <div className="p-3 bg-muted/40 rounded-lg border border-border">
                                <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter">Pontuação TRAQ</div>
                                <div className={`text-lg font-bold flex items-center gap-2 ${getRiskColor(tree.pontuacao ?? undefined)}`}>
                                    <span>{tree.pontuacao || 0}</span>
                                    <span className="h-4 w-px bg-border mx-1" />
                                    <span className="text-xs uppercase">{getRiskLabel(tree.pontuacao ?? undefined)}</span>
                                </div>
                            </div>

                            {tree.risk_factors && tree.risk_factors.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {tree.risk_factors.map((factor, i) => {
                                        if (String(factor) !== '1') return null;
                                        return (
                                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 whitespace-nowrap">
                                                {criteria && criteria[i] ? criteria[i].criterio : `RF ${i}`}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Mini Map */}
                        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
                            <div className="relative h-[180px]">
                                {coords ? (
                                    <TreeMiniMap
                                        latitude={coords.latitude}
                                        longitude={coords.longitude}
                                        species={tree.especie || undefined}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-muted text-xs text-muted-foreground">Sem coordenadas</div>
                                )}
                            </div>
                            {tree.local && (
                                <div className="p-3 text-[11px] bg-muted/20 border-t border-border">
                                    <span className="opacity-50 block mb-0.5 underline">REFERÊNCIA</span>
                                    {tree.local}
                                </div>
                            )}
                        </div>

                        {/* Photos */}
                        <div className="space-y-4 pb-12">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground opacity-60">
                                    <Image className="w-4 h-4" />
                                    FOTOS ({photos.length})
                                </h2>
                                {hasPermission('edit_trees') && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[10px] px-2"
                                            disabled={isUploading || !tree.instalacao_id}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {isUploading ? <span className="animate-spin">⏳</span> : <Upload className="w-3 h-3 mr-1" />}
                                            {isUploading ? `${uploadProgress}%` : 'ADICIONAR'}
                                        </Button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} disabled={isUploading} />
                                    </>
                                )}
                            </div>

                            {photos.length === 0 ? (
                                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-muted/50 rounded-lg">Nenhuma foto enviada</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-1">
                                    {photos.slice(0, 9).map((photo, index) => (
                                        <button key={photo.id} onClick={() => openPhotoViewer(index)} className="aspect-square rounded border border-border bg-muted overflow-hidden hover:opacity-80 transition-opacity">
                                            <img src={photo.signedUrl} alt={photo.filename} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="p-6 m-0 outline-none animate-in slide-in-from-right-2 duration-300">
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                            <FileText className="w-12 h-12" />
                            <p className="text-sm font-medium">Nenhum histórico disponível</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="p-6 m-0 outline-none animate-in slide-in-from-right-2 duration-300">
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                            <ArrowLeft className="w-12 h-12 rotate-45" />
                            <p className="text-sm font-medium">Análise de tendências em desenvolvimento</p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {viewerOpen && photos.length > 0 && (
                <PhotoViewer photos={photos} initialIndex={viewerInitialIndex} onClose={() => setViewerOpen(false)} />
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Árvore?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
