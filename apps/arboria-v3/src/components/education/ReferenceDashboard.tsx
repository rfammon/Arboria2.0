import { EducationSidebar } from './EducationSidebar';
import { Book } from 'lucide-react';

export function ReferenceDashboard() {
    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 h-[calc(100vh-100px)]">
            {/* Side Index (Sidebar) */}
            <EducationSidebar />

            {/* Main Content Area (Placeholder) */}
            <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-1 flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md p-8 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <Book className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Biblioteca de Referência</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Selecione um tópico no menu lateral para visualizar o conteúdo detalhado, normas e procedimentos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
