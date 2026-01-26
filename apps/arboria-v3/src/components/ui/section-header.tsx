import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "./badge";

interface SectionHeaderProps {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({
  badge,
  title,
  highlight,
  description,
  icon: Icon,
  className,
  align = 'center',
}: SectionHeaderProps) {
  const isLeft = align === 'left';

  return (
    <div className={cn(
      "group flex flex-col space-y-6 mb-8", 
      isLeft ? "items-start text-left" : "items-center text-center",
      className
    )}>
      {/* Badge Superior */}
      <Badge 
        variant="sucesso" 
        className="gap-2 px-4 py-1.5 border-emerald-500/20 shadow-none animate-in fade-in slide-in-from-bottom-4 duration-1000"
      >
        <Icon className="w-3.5 h-3.5 stroke-[2.5] text-emerald-500" />
        <span className="translate-y-[0.5px] tracking-wide font-black uppercase text-[10px]">{badge}</span>
      </Badge>

      <div className={cn(
        "space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both",
        isLeft ? "" : "max-w-4xl"
      )}>
        {/* Título Principal */}
        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter uppercase">
          {title}{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent italic font-display">
            {highlight}
          </span>
        </h2>

        {/* Descrição */}
        <p className={cn(
          "text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 max-w-2xl",
          isLeft ? "" : "mx-auto"
        )}>
          {description}
        </p>
      </div>
      
      {/* Detalhe Visual */}
      <div className={cn(
        "w-12 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-500",
        isLeft ? "" : "mx-auto"
      )} />
    </div>
  );
}
