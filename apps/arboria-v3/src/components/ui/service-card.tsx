import { cn } from "@/lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  illustration: React.ReactNode;
  onClick?: () => void;
  className?: string;
  colorClass?: string; // e.g. "bg-slate-900"
}

export function ServiceCard({ 
  title, 
  description, 
  icon: Icon, 
  illustration, 
  onClick, 
  className,
  colorClass = "bg-card text-card-foreground"
}: ServiceCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative group overflow-hidden rounded-[1.5rem] p-6 h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-xl border-0",
        colorClass,
        className
      )}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 dark:bg-white/5 bg-black/5 rounded-full blur-[60px] group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors pointer-events-none" />
      
      {/* Illustration - Absolute positioned to bottom right */}
      <div className="absolute -bottom-4 -right-4 w-32 h-32 md:w-40 md:h-40 opacity-90 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 ease-out z-0">
        {illustration}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start h-full">
        {Icon && (
          <div className="mb-4 inline-flex p-3 rounded-2xl bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
        )}
        
        <div className="mt-auto max-w-[75%]">
          <h3 className="text-2xl font-bold tracking-tight mb-2 leading-tight">{title}</h3>
          <p className="text-sm opacity-80 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Indicator (Mobile friendly) */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
          <div className="bg-black/10 dark:bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
