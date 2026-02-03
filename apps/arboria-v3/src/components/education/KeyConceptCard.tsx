import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, Info, Sparkles } from 'lucide-react';
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
 * KeyConceptCard - A premium, interactive card for educational content.
 * Follows "Arboria Premium" aesthetic with glassmorphism, dynamic accents, and smooth transitions.
 */
export const KeyConceptCard: React.FC<KeyConceptCardProps> = ({
  title,
  description,
  details,
  icon: Icon,
  image,
  category,
  color = 'hsl(var(--primary))',
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.23, 1, 0.32, 1],
        layout: { duration: 0.4, ease: "circOut" }
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        "group relative overflow-hidden rounded-[var(--border-radius-lg)] border p-5",
        "glass-default interactive-hover",
        "border-white/10 dark:border-white/5",
        isExpanded ? "ring-2 shadow-2xl" : "shadow-lg",
        className
      )}
      style={{ 
        boxShadow: isExpanded ? `0 20px 40px -15px ${color}20` : undefined,
        borderColor: isExpanded ? `${color}40` : undefined,
      }}
    >
      {/* Dynamic Glow Effect */}
      <div 
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-40"
        style={{ backgroundColor: color }}
      />
      
      {/* Hover Shine Effect */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {Icon ? (
                <div 
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ border: `1px solid ${color}30` }}
                >
                  <Icon 
                    size={28} 
                    strokeWidth={1.5} 
                    style={{ color }}
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                  />
                </div>
              ) : image ? (
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <img src={image} alt={title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <Info size={28} strokeWidth={1.5} style={{ color }} />
                </div>
              )}
              
              {/* Little Sparkle for "Premium" feel */}
              {isExpanded && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-1 -top-1 text-yellow-400"
                >
                  <Sparkles size={14} fill="currentColor" />
                </motion.div>
              )}
            </div>
            
            <div className="flex flex-col">
              {category && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                  {category}
                </span>
              )}
              <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {title}
              </h3>
            </div>
          </div>

          <motion.div
            animate={{ 
              rotate: isExpanded ? 90 : 0,
              backgroundColor: isExpanded ? color : 'rgba(255,255,255,0.05)',
              color: isExpanded ? 'white' : 'rgba(255,255,255,0.4)'
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          >
            <ChevronRight size={18} />
          </motion.div>
        </div>

        {/* Description Section */}
        <div className="relative">
          <p className={cn(
            "text-base leading-relaxed text-muted-foreground transition-all duration-500",
            !isExpanded && "line-clamp-2"
          )}>
            {description}
          </p>
          
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 h-4 w-full bg-gradient-to-t from-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && details && (
            <motion.div
              initial={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
              animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
              exit={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4 border-t border-white/5 pt-4">
                <div className="prose prose-sm prose-invert max-w-none text-muted-foreground/80 educational-content">
                  {typeof details === 'string' ? (
                    <p className="animate-in fade-in slide-in-from-top-2 duration-700 fill-mode-both">
                      {details}
                    </p>
                  ) : (
                    details
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-medium text-primary/60 italic uppercase tracking-wider">
                  <div className="h-[1px] w-4 bg-primary/30" />
                  Detalhes do Conceito
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Bottom Accent */}
      <motion.div 
        layoutId={`accent-${title}`}
        className="absolute bottom-0 left-0 h-[3px] bg-primary"
        initial={{ width: 0 }}
        animate={{ width: isExpanded ? '100%' : '20%' }}
        transition={{ duration: 0.6, ease: "anticipate" }}
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

export default KeyConceptCard;
