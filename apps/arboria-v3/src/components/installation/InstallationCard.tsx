import { cn } from '@/lib/utils';
import { Trees, ClipboardCheck, AlertTriangle, Star } from 'lucide-react';
import type { Installation } from '@/types/installation';
import { Badge } from '@/components/ui/badge';

interface InstallationCardProps {
    installation: Installation;
    onSelect: () => void;
    isActive: boolean;
}

export function InstallationCard({ installation, onSelect, isActive }: InstallationCardProps) {
    // Simulated stats for UI demonstration as requested in the spec
    const stats = {
        trees: installation.numero_arvores_estimado || Math.floor(Math.random() * 500) + 50,
        tasks: Math.floor(Math.random() * 12),
        risk: ['Baixo', 'Médio', 'Alto', 'Crítico'][Math.floor(Math.random() * 4)]
    };

    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative overflow-hidden rounded-[2rem] h-[280px] cursor-pointer group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between p-8 text-slate-900 dark:text-white bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/10",
                isActive && "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20"
            )}
        >
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1000&auto=format&fit=crop" 
                    alt="" 
                    className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/80 dark:to-slate-950/80" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight">
                            {installation.nome}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {installation.tipo} • {installation.localizacao?.cidade || 'Localização não definida'}
                        </p>
                    </div>
                    
                    {isActive && (
                        <Badge className="bg-emerald-500 text-slate-950 border-none font-bold gap-1 px-3 py-1 animate-pulse">
                            <Star className="w-3 h-3 fill-current" />
                            Ativa
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="relative z-10 grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                <div className="flex flex-col items-center gap-1">
                    <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-lg font-bold">{stats.trees}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Árvores</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-bold">{stats.tasks}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Tarefas</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <AlertTriangle className={cn(
                        "w-5 h-5",
                        stats.risk === 'Crítico' ? 'text-rose-600 dark:text-rose-500' : 
                        stats.risk === 'Alto' ? 'text-orange-600 dark:text-orange-500' : 'text-amber-600 dark:text-amber-400'
                    )} />
                    <span className="text-lg font-bold">{stats.risk}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Risco</span>
                </div>
            </div>

            {/* Subtle Glowing Border Effect for Active State */}
            {isActive && (
                <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-[2rem] pointer-events-none" />
            )}
        </div>
    );
}
