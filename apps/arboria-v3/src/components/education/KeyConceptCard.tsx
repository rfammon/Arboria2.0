import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { RotateCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyConceptCardProps {
  title: string;
  description: string;
  details?: string | React.ReactNode;
  icon?: LucideIcon;
  image?: string;
  category?: string;
  color?: string; // Hex or CSS variable for accent
  className?: string;
}

/**
 * KeyConceptCard - 3D Flip Card for educational content.
 * Redesigned for Grid Interaction: Square Aspect Ratio, Big Icon Front, Concept Back.
 */
export const KeyConceptCard: React.FC<KeyConceptCardProps> = ({
  title,
  description,
  details,
  icon: Icon,
  image,
  category,
  color = '#10b981',
  className,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);

    // Sutil Feedback Sonoro (Click Premium)
    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Tom mais agudo e curto para "flip"
        osc.frequency.setValueAtTime(isFlipped ? 300 : 500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isFlipped ? 150 : 800, ctx.currentTime + 0.15);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      // Ignora erro de audio
    }
  };

  return (
    <div className={cn("relative w-full h-64 perspective-1000", className)}>
      <motion.div
        className="relative h-full w-full cursor-pointer transition-all duration-500"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleFlip}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 h-full w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backface-hidden flex flex-col items-center justify-center p-4 text-center group hover:shadow-2xl hover:border-emerald-500/50 hover:-translate-y-1 transition-all"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background Gradient Blob */}
          <div
            className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-emerald-500/10 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"
            style={{
              background: `linear-gradient(to bottom left, transparent, ${color}30)`
            }}
          />

          <div
            className="w-16 h-16 mb-3 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
            style={{ color: color }}
          >
            {Icon ? <Icon size={48} strokeWidth={1.5} /> : <Info size={48} strokeWidth={1.5} />}
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight px-1 mb-6">
            {title}
          </h3>

          <div className="absolute bottom-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
            <RotateCw size={12} />
            <span>Ver Conceito</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          className="absolute inset-0 h-full w-full rounded-3xl bg-slate-900 dark:bg-emerald-950 border border-slate-800 dark:border-emerald-900/50 shadow-xl overflow-hidden backface-hidden flex flex-col p-6 text-center transform rotate-y-180 items-center justify-center"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: 'hidden',
            background: `linear-gradient(145deg, ${color}10, #0f172a)`
          }}
        >
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-full w-full">
            <p className="text-sm font-medium text-slate-200 dark:text-emerald-50 leading-relaxed">
              {description || details}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
