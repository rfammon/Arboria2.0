import { 
    DefinitionsIllustration, 
    PlanningIllustration, 
    LegalIllustration, 
    PreparationIllustration, 
    PruningIllustration, 
    SafetyIllustration,
    WasteIllustration,
    GlossaryIllustration
} from '../illustrations/education-illustrations';

interface TopicHeaderProps {
    topicId: string;
    title: string;
    description: string;
}

const ILLUSTRATION_MAP: Record<string, React.ComponentType<any>> = {
    definitions: DefinitionsIllustration,
    planning: PlanningIllustration,
    legal: LegalIllustration,
    preparation: PreparationIllustration,
    pruning: PruningIllustration,
    safety: SafetyIllustration,
    waste: WasteIllustration,
    glossary: GlossaryIllustration,
    // default fallback
    default: DefinitionsIllustration
};

export function TopicHeader({ topicId, title, description }: TopicHeaderProps) {
    const Illustration = ILLUSTRATION_MAP[topicId] || ILLUSTRATION_MAP.default;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12 mb-8 shadow-sm">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl opacity-30" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left space-y-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 relative group">
                    <div className="absolute inset-0 bg-slate-100 dark:bg-white/5 rounded-full blur-xl transform group-hover:scale-110 transition-transform duration-700" />
                    <Illustration className="w-full h-full drop-shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3" />
                </div>
            </div>
        </div>
    );
}