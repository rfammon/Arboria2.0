import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';
import { EDUCATION_TOPICS } from '../../data/educationTopics';
import { cn } from '../../lib/utils';

export function EducationSidebar() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const filteredTopics = EDUCATION_TOPICS.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 lg:h-[calc(100vh-100px)] lg:overflow-y-auto pr-2 custom-scrollbar border-r border-slate-200 dark:border-slate-800">
            <div className="space-y-4 pt-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-display">
                    Biblioteca <span className="text-primary italic">ArborIA</span>
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar tópicos..."
                        className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
                    Índice Geral
                </h3>
                <div className="space-y-1">
                    {filteredTopics.map((topic) => {
                        const isActive = location.pathname.includes(`/education/${topic.id}`);
                        return (
                            <button
                                key={topic.id}
                                onClick={() => navigate(`/education/${topic.id}`)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group",
                                    isActive 
                                        ? "bg-primary/10 text-primary" 
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
                                )}
                            >
                                <topic.icon className={cn(
                                    "w-4 h-4 transition-colors",
                                    isActive ? "text-primary" : "opacity-70 group-hover:text-primary"
                                )} />
                                <span className="truncate">{topic.title}</span>
                                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}