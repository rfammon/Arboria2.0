import { type SVGProps } from 'react';
import { cn } from '../../lib/utils';

export const DefinitionsIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-blue-600 dark:text-blue-400", className)} {...props}>
    <path d="M40 160C40 160 40 60 40 60C40 60 70 40 100 60C130 40 160 60 160 60V160C160 160 130 140 100 160C70 140 40 160 40 160Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M100 60V160" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <path d="M60 90H90" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M60 110H90" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M110 90H140" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M110 110H140" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <circle cx="100" cy="110" r="20" fill="currentColor" fillOpacity="0.1"/>
  </svg>
);

export const PlanningIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-emerald-600 dark:text-emerald-400", className)} {...props}>
    <rect x="50" y="40" width="100" height="130" rx="10" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="6"/>
    <path d="M70 30H130V50H70V30Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="4"/>
    <path d="M70 80H130" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M70 100H110" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M70 120H130" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <rect x="110" y="110" width="30" height="30" rx="8" fill="currentColor" fillOpacity="0.2" transform="rotate(15 125 125)"/>
    <path d="M115 125L120 130L128 120" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

export const LegalIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-amber-600 dark:text-amber-400", className)} {...props}>
    <path d="M100 40V160" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <path d="M60 50H140" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <path d="M40 160H160" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <path d="M40 80L60 120H40L40 80Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M160 80L140 120H160L160 80Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M60 50L50 100" stroke="currentColor" strokeWidth="2"/>
    <path d="M140 50L150 100" stroke="currentColor" strokeWidth="2"/>
    <path d="M50 100C50 115 65 115 65 100" stroke="currentColor" strokeWidth="4"/>
    <path d="M150 100C150 115 135 115 135 100" stroke="currentColor" strokeWidth="4"/>
  </svg>
);

export const PreparationIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-red-600 dark:text-red-400", className)} {...props}>
     <path d="M50 140C50 100 70 80 100 80C130 80 150 100 150 140" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="6"/>
     <path d="M40 140H160" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
     <rect x="95" y="60" width="10" height="20" fill="currentColor" fillOpacity="0.5"/>
     <path d="M70 110L130 110" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"/>
     <path d="M100 40V60" stroke="currentColor" strokeWidth="4" strokeDasharray="4 4"/>
     <circle cx="150" cy="60" r="10" fill="currentColor" fillOpacity="0.4"/>
  </svg>
);

export const PruningIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-violet-600 dark:text-violet-400", className)} {...props}>
    {/* Chainsaw Body */}
    <rect x="50" y="80" width="80" height="60" rx="10" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="6"/>
    {/* Blade */}
    <path d="M130 100H180C190 100 190 120 180 120H130" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="6"/>
    {/* Teeth */}
    <path d="M130 95L140 90L150 95L160 90L170 95L180 90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M130 125L140 130L150 125L160 130L170 125L180 130" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Handle */}
    <path d="M60 80V60H110V80" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    {/* Rear Handle */}
    <path d="M40 90H20V130H40" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    {/* Engine Details */}
    <circle cx="90" cy="110" r="15" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M90 95V85" stroke="currentColor" strokeWidth="4"/>
  </svg>
);

export const ChainsawIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className} 
        {...props}
    >
        <path d="M13 14h7a2 2 0 0 0 0-4h-7" /> 
        <path d="M13 10V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4" />
        <path d="M7 15l-3 3 3 3h4l2-2h-3v-4" />
        <path d="M8 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <circle cx="9" cy="12" r="1" />
    </svg>
);


export const SafetyIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-yellow-600 dark:text-yellow-400", className)} {...props}>
    <path d="M100 40L150 60V120C150 150 100 170 100 170C100 170 50 150 50 120V60L100 40Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
    <path d="M100 70V140" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M70 90H130" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <circle cx="100" cy="90" r="15" fill="currentColor" fillOpacity="0.3"/>
  </svg>
);

export const WasteIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-green-600 dark:text-green-400", className)} {...props}>
    <path d="M100 60L140 100H110V140H90V100H60L100 60Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M100 160C133 160 160 133 160 100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="20 10" strokeOpacity="0.3"/>
    <path d="M100 160C67 160 40 133 40 100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="20 10" strokeOpacity="0.3"/>
    <circle cx="100" cy="100" r="25" stroke="currentColor" strokeWidth="4" strokeOpacity="0.8"/>
  </svg>
);

export const GlossaryIllustration = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full text-slate-600 dark:text-slate-400", className)} {...props}>
    <rect x="50" y="40" width="100" height="120" rx="8" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="6"/>
    <path d="M80 70H120" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    <path d="M80 100H110" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M80 120H120" stroke="currentColor" strokeWidth="4" strokeOpacity="0.5"/>
    <path d="M150 140L160 150L170 140" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"/>
    <rect x="40" y="50" width="10" height="100" fill="currentColor" fillOpacity="0.2"/>
  </svg>
);
