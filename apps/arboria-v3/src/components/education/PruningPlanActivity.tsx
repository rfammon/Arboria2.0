import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, AlertTriangle, TreeDeciduous, Info, CheckCircle2, XCircle } from 'lucide-react';

interface PruningPlanActivityProps {
    onComplete: (xp: number) => void;
}

const PRUNING_TYPES = [
  { id: 'limpeza', label: 'Poda de Limpeza', icon: <TreeDeciduous />, color: 'bg-emerald-500/20', target: 'copa', description: 'Remoção de galhos secos e doentes.' },
  { id: 'levantamento', label: 'Levantamento de Copa', icon: <Scissors />, color: 'bg-blue-500/20', target: 'ramos_baixos', description: 'Liberação de gabarito para pedestres (2.5m).' },
  { id: 'adequacao', label: 'Poda de Adequação', icon: <Info />, color: 'bg-amber-500/20', target: 'fuste', description: 'Afastamento de redes elétricas e prédios.' },
  { id: 'emergencia', label: 'Poda de Emergência', icon: <AlertTriangle />, color: 'bg-red-500/20', target: 'base', description: 'Risco iminente de queda ou falha radical.' },
];

const Hotspot = ({ id, label, position, onDrop, status }: any) => {
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = (e: React.DragEvent) => {
    const typeId = e.dataTransfer.getData('pruningType');
    onDrop(id, typeId);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`absolute transition-all duration-300 rounded-full border-2 border-dashed flex items-center justify-center
        ${position} w-24 h-24 md:w-32 md:h-32 backdrop-blur-sm z-10
        ${status === 'idle' ? 'border-white/40 bg-white/5 hover:bg-white/10' : ''}
        ${status === 'success' ? 'border-emerald-400 bg-emerald-400/20 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''}
        ${status === 'error' ? 'border-red-400 bg-red-400/20 animate-shake' : ''}
      `}
    >
      <div className="flex flex-col items-center gap-1 text-center px-2">
        {status === 'success' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </motion.div>
        ) : status === 'error' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <XCircle className="w-6 h-6 text-red-400" />
            </motion.div>
        ) : null}
        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
          {label}
        </span>
      </div>
    </div>
  );
};

export const PruningPlanActivity: React.FC<PruningPlanActivityProps> = ({ onComplete }) => {
  const [results, setResults] = useState<Record<string, 'idle' | 'success' | 'error'>>({
    copa: 'idle',
    ramos_baixos: 'idle',
    fuste: 'idle',
    base: 'idle'
  });
  const [score, setScore] = useState(0);
  const [xpGained, setXpGained] = useState(0);

  const handleDrop = (hotspotId: string, typeId: string) => {
    const type = PRUNING_TYPES.find(p => p.id === typeId);
    
    if (type?.target === hotspotId) {
      if (results[hotspotId] !== 'success') {
        setResults(prev => ({ ...prev, [hotspotId]: 'success' }));
        setScore(prev => prev + 1);
        setXpGained(prev => prev + 50);
        
        // Disparar som via evento customizado se necessário, ou usar AudioContext local
        console.log(`[Activity] Sucesso: ${typeId} em ${hotspotId}`);
      }
    } else {
      setResults(prev => ({ ...prev, [hotspotId]: 'error' }));
      setTimeout(() => {
        setResults(prev => ({ ...prev, [hotspotId]: 'idle' }));
      }, 1000);
    }
  };

  const isFinished = score === 4;

  return (
    <div 
      data-density="field"
      className="relative h-full w-full bg-slate-950 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-white/10"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-blue-950/20 pointer-events-none" />

      {/* Header Info */}
      <div className="absolute top-6 left-6 z-20">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl">
          <h1 className="text-xl font-black tracking-tight text-white">Plano de Poda</h1>
          <p className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest">Nível: Criar (Bloom)</p>
          <div className="mt-4 flex items-center gap-3">
             <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${(score / 4) * 100}%` }}
                />
             </div>
             <span className="text-[10px] font-black text-white/40">{score}/4</span>
          </div>
        </div>
      </div>

      {/* Main Simulation Area */}
      <main className="flex-1 relative flex items-center justify-center p-8">
        <div className="relative w-full max-w-lg aspect-[3/4]">
          {/* SVG Tree Illustration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <TreeDeciduous size={400} strokeWidth={0.5} className="text-emerald-500" />
          </div>

          {/* Hotspots */}
          <Hotspot id="copa" label="Copa / Folhas" position="top-[10%] left-[30%]" status={results.copa} onDrop={handleDrop} />
          <Hotspot id="ramos_baixos" label="Gabarito Viário" position="top-[45%] left-[5%]" status={results.ramos_baixos} onDrop={handleDrop} />
          <Hotspot id="fuste" label="Rede Elétrica" position="top-[55%] right-[5%]" status={results.fuste} onDrop={handleDrop} />
          <Hotspot id="base" label="Estabilidade" position="bottom-[5%] left-[30%]" status={results.base} onDrop={handleDrop} />

          {/* Lines / Indicators */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full opacity-20" viewBox="0 0 100 100">
             <path d="M50 80 L50 20" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
             <path d="M20 50 L80 50" stroke="white" strokeWidth="0.1" />
          </svg>
        </div>
      </main>

      {/* Tools Drawer */}
      <aside className="w-full md:w-80 bg-white/5 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <Scissors size={16} className="text-emerald-400" />
            Técnicas
          </h2>
          <p className="text-[11px] text-white/40 font-medium leading-relaxed">
            Arraste a técnica para a região correta da anatomia arbórea.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 overflow-y-auto pr-1">
          {PRUNING_TYPES.map((type) => (
            <motion.div
              key={type.id}
              draggable={results[type.target] !== 'success'}
              onDragStart={(e: any) => {
                e.dataTransfer.setData('pruningType', type.id);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-4 rounded-xl border transition-all group relative overflow-hidden
                ${results[type.target] === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 opacity-40 cursor-not-allowed' 
                    : 'bg-white/5 border-white/10 hover:border-emerald-500/40 cursor-grab active:cursor-grabbing'}
              `}
            >
              <div className="flex items-start gap-3 z-10 relative">
                <div className={`p-2 rounded-lg ${type.color} text-white group-hover:scale-110 transition-transform`}>
                  {type.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">{type.label}</h3>
                  <p className="text-[9px] text-white/40 font-medium mt-1 leading-tight">{type.description}</p>
                </div>
              </div>
              {results[type.target] === 'success' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
              )}
            </motion.div>
          ))}
        </div>

        {isFinished ? (
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onComplete(xpGained)}
                className="mt-auto w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
            >
                Concluir Atividade
                <CheckCircle2 size={18} />
            </motion.button>
        ) : (
            <div className="mt-auto p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <Info size={16} className="text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-100/60 italic leading-relaxed">
                    Dica: Poda de Levantamento remove galhos inferiores para garantir o "Gabarito Viário".
                </p>
            </div>
        )}
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  );
};
