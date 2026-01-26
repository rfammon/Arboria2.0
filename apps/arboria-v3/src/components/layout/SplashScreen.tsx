import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';

/**
 * SplashScreen Component
 * Concept: "Where Technology Blooms"
 * A high-end, minimalist entry experience for ArborIA.
 * Features a custom-crafted SVG leaf/circuit fusion and brand-aligned gradients.
 * Now theme-aware and unified with the login branding.
 */
export const SplashScreen: React.FC = () => {
  const { theme } = useTheme();

  // Theme awareness: any theme containing "dark" or "forest" is dark, others are light.
  const isDark = theme?.toLowerCase().includes('dark') || theme?.toLowerCase().includes('forest');

  // SVG Animation Variants
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 3, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: 1.8 + i * 0.1, duration: 0.4, ease: "backOut" }
    })
  };

  const bgColors = isDark ? "bg-[#020617]" : "bg-slate-50";
  
  // Visual Palette Switch
  const glowColors = isDark 
    ? [
        'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(2, 6, 23, 0) 70%)',
        'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(2, 6, 23, 0) 70%)',
        'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(2, 6, 23, 0) 70%)',
      ]
    : [
        'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(248, 250, 252, 0) 70%)',
        'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(248, 250, 252, 0) 70%)',
        'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(248, 250, 252, 0) 70%)',
      ];

  // Adjust stroke colors for visibility
  const strokeEmerald = isDark ? "#34D399" : "#059669";
  const strokeBlue = isDark ? "#60A5FA" : "#2563EB";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.1,
        transition: { duration: 1, delay: 0.5, ease: "easeInOut" }
      }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${bgColors} overflow-hidden`}
    >
      {/* Dynamic Background Glow - Visual Palette Awareness */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          background: glowColors
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Hand-crafted Circuit Leaf Logo */}
      <motion.div
        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.6 } }}
        className="relative w-48 h-48 md:w-64 md:h-64 mb-8"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full filter ${isDark ? 'drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'drop-shadow-[0_0_15px_rgba(37,99,235,0.15)]'}`}
        >
          {/* Organic Leaf Outline - Adjusts stroke for visibility */}
          <motion.path
            d="M50 90C50 90 85 65 85 35C85 15 65 10 50 25C35 10 15 15 15 35C15 65 50 90 50 90Z"
            stroke="url(#leafGradient)"
            strokeWidth="1.5"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />

          {/* Circuit Veins */}
          <motion.path
            d="M50 85V30"
            stroke={strokeEmerald}
            strokeWidth="1"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />

          <motion.path d="M50 65L70 50H75" stroke={strokeBlue} strokeWidth="0.8" variants={pathVariants} initial="hidden" animate="visible" />
          <motion.circle cx="75" cy="50" r="1.5" fill={strokeBlue} variants={nodeVariants} custom={1} initial="hidden" animate="visible" />

          <motion.path d="M50 55L30 40H25" stroke={strokeEmerald} strokeWidth="0.8" variants={pathVariants} initial="hidden" animate="visible" />
          <motion.circle cx="25" cy="40" r="1.5" fill={strokeEmerald} variants={nodeVariants} custom={2} initial="hidden" animate="visible" />

          <motion.path d="M50 45L65 30V25" stroke={strokeBlue} strokeWidth="0.8" variants={pathVariants} initial="hidden" animate="visible" />
          <motion.circle cx="65" cy="25" r="1.5" fill={strokeBlue} variants={nodeVariants} custom={3} initial="hidden" animate="visible" />

          <defs>
            <linearGradient id="leafGradient" x1="50" y1="90" x2="50" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={strokeBlue} />
              <stop offset="100%" stopColor={strokeEmerald} />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          animate={{
            boxShadow: isDark 
              ? [
                  "0 0 20px rgba(37,99,235,0.2)",
                  "0 0 40px rgba(16,185,129,0.3)",
                  "0 0 20px rgba(37,99,235,0.2)"
                ]
              : [
                  "0 0 20px rgba(37,99,235,0.1)",
                  "0 0 40px rgba(16,185,129,0.15)",
                  "0 0 20px rgba(37,99,235,0.1)"
                ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-xl ${isDark ? 'bg-white/10' : 'bg-black/5'}`}
        />
      </motion.div>

      {/* Typography Reveal - Unified Branding */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-black tracking-tighter"
        >
          <span className="text-emerald-500">Arbo</span>
          <span className="text-blue-600">IA</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 2.8 }}
          className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[10px] md:text-xs mt-4 tracking-[0.4em] font-extralight uppercase`}
        >
          Gestão inteligente de ecossistemas urbanos e industriais.
        </motion.p>
      </div>

      <div className={`absolute bottom-16 w-32 h-[1px] ${isDark ? 'bg-slate-900' : 'bg-slate-200'} overflow-hidden`}>
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className={`w-full h-full bg-gradient-to-r from-transparent ${isDark ? 'via-[#2563EB]' : 'via-blue-500'} to-transparent`}
        />
      </div>

      <div className={`absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${!isDark ? 'invert' : ''}`} />
    </motion.div>
  );
};
