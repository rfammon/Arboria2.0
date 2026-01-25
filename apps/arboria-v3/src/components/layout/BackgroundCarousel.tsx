import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  '/login-carousel/urban_forestry.png',
  '/login-carousel/tablet_data.png',
  '/login-carousel/industrial_plantation.png',
  '/login-carousel/engineer_working.png',
];

export default function BackgroundCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {images.map((src, index) => index === activeIndex && (
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: 1,
              scale: 1.1
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 2, ease: "easeInOut" },
              scale: { duration: 10, ease: "linear" }
            }}
            className="absolute inset-0"
          >
            <img
              src={src}
              alt="Background"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Dark Dimmer Overlay */}
      <div className="absolute inset-0 bg-slate-950/60 pointer-events-none z-10" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40 pointer-events-none z-10" />
      
      {/* Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none z-10" />
    </div>
  );
}
