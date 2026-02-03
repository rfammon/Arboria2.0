import React, { useState, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { RotateCw, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyConceptCardProps {
  title: string;
  description: string;
  details?: string | React.ReactNode;
  icon?: LucideIcon;
  category?: string;
  color?: string; // Hex for accent
  className?: string;
}

/**
 * KeyConceptCard - Redesigned with Glassmorphism, Parallax, and Dynamic Gradients.
 * Optimized for impactful visual storytelling and interactive learning.
 */
export const KeyConceptCard: React.FC<KeyConceptCardProps> = ({
  title,
  description,
  details,
  icon: Icon,
  category,
  color = '#10b981',
  className,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Parallax Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transform mouse position into rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Reset parallax on flip
    x.set(0);
    y.set(0);

    // Audio Feedback
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(isFlipped ? 220 : 440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isFlipped ? 110 : 880, ctx.currentTime + 0.2);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio fails silently
    }
  };

  // Helper for dynamic gradients based on the color prop
  const gradientStyle = useMemo(() => ({
    '--accent-color': color,
    '--accent-color-transparent': `${color}15`,
    '--accent-color-glow': `${color}30`,
  } as React.CSSProperties), [color]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("group relative w-full aspect-[4/5] min-h-[22rem] perspective-2000", className)}
      style={gradientStyle}
    >
      {/* Outer Glow Effect */}
      <div 
        className="absolute -inset-4 bg-[var(--accent-color-glow)] rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" 
      />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleFlip}
        style={{
          rotateX: isFlipped ? 0 : rotateX,
          rotateY: isFlipped ? 180 : rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ 
          rotateY: { type: "spring", stiffness: 120, damping: 20 },
          rotateX: { type: "spring", stiffness: 150, damping: 30 }
        }}
        className="relative w-full h-full cursor-pointer"
      >
        {/* FRONT FACE */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden backface-hidden",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl",
            "flex flex-col items-center justify-between p-8 text-center"
          )}
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <div 
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-3xl animate-pulse"
              style={{ background: `radial-gradient(circle, var(--accent-color) 0%, transparent 70%)` }}
            />
            <div 
              className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-3xl animate-pulse delay-700"
              style={{ background: `radial-gradient(circle, var(--accent-color) 0%, transparent 70%)`, opacity: 0.5 }}
            />
          </div>

          {/* Category Tag */}
          {category && (
            <div 
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border"
              style={{ 
                borderColor: 'var(--accent-color-transparent)',
                backgroundColor: 'var(--accent-color-transparent)',
                color: 'var(--accent-color)',
                transform: 'translateZ(20px)'
              }}
            >
              {category}
            </div>
          )}

          {/* Main Visual Content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 mt-4" style={{ transformStyle: 'preserve-3d' }}>
            <div 
              className="relative"
              style={{ transform: 'translateZ(50px)' }}
            >
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center relative shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, var(--accent-color), transparent)`,
                  boxShadow: `0 10px 30px -10px var(--accent-color-glow)`
                }}
              >
                <div className="absolute inset-[1px] bg-white dark:bg-slate-950 rounded-[23px] flex items-center justify-center">
                  {Icon ? (
                    <Icon size={44} style={{ color: color }} className="drop-shadow-sm" />
                  ) : (
                    <Info size={44} style={{ color: color }} />
                  )}
                </div>
              </div>
              {/* Decorative Sparkle */}
              <Sparkles 
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100" 
                style={{ color: color }}
              />
            </div>

            <h3 
              className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-50 leading-tight"
              style={{ transform: 'translateZ(30px)' }}
            >
              {title}
            </h3>
          </div>

          {/* Bottom Prompt */}
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-6">
            <RotateCw size={14} className="animate-spin-slow" />
            <span>Explorar Conceito</span>
          </div>
          
          {/* Glass Gloss Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* BACK FACE */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden backface-hidden rotate-y-180",
            "bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl flex flex-col p-8"
          )}
          style={{ 
            transform: "rotateY(180deg)", 
            backfaceVisibility: 'hidden',
            boxShadow: `inset 0 0 100px -30px var(--accent-color-glow)`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-color-transparent)' }}
              >
                {Icon ? <Icon size={16} style={{ color: color }} /> : <Info size={16} style={{ color: color }} />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Conceito</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-400">
              <RotateCw size={12} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />
              {title}
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              {description}
            </p>
            {details && (
              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-2">Aprofundamento</div>
                <div className="text-slate-400 text-xs leading-relaxed">
                  {details}
                </div>
              </div>
            )}
          </div>

          {/* Subtle footer decoration */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ 
              background: `linear-gradient(90deg, transparent, var(--accent-color), transparent)`,
              opacity: 0.5
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
