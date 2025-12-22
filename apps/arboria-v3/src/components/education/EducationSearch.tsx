import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchService, type SearchResult } from '../../lib/education/SearchService';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

export function EducationSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize search service on component mount
        const init = async () => {
            setLoading(true);
            await searchService.initialize();
            setLoading(false);
            setReady(true);
        };
        init();

        // Click outside handler
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 2 && ready) {
            const hits = searchService.search(value);
            setResults(hits);
            setShowResults(true);
        } else {
            setResults([]);
            setShowResults(false);
        }
    };

    const handleSelect = (result: SearchResult) => {
        navigate(`/education/${result.topicId}`);
        setShowResults(false);
        setQuery('');
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        // Simple substring match for display (Fuse does fuzzy, but we highlight exactish for UI)
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text.slice(0, 100) + '...';

        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + 80);
        return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
    };

    return (
        <div className="relative w-full max-w-xl" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    type="text"
                    placeholder={loading ? "Preparando busca..." : "Buscar nos manuais (ex: poda, risco, EPIs)..."}
                    className="pl-9 w-full bg-white dark:bg-gray-800"
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => query.length > 2 && setShowResults(true)}
                    disabled={loading}
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
            </div>

            {showResults && results.length > 0 && (
                <Card className="absolute top-full mt-2 w-full z-50 max-h-[400px] overflow-y-auto shadow-lg animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {results.map((result, index) => (
                            <button
                                key={`${result.topicId}-${index}`}
                                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                                onClick={() => handleSelect(result)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-green-600" />
                                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                            {result.topicTitle}
                                        </span>
                                        <span className="text-gray-400 text-xs">•</span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {result.section}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pl-6">
                                    {highlightMatch(result.content, query)}
                                </p>
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            {showResults && query.length > 2 && results.length === 0 && (
                <Card className="absolute top-full mt-2 w-full z-50 p-4 text-center text-gray-500 text-sm">
                    Nenhum resultado encontrado para "{query}"
                </Card>
            )}
        </div>
    );
}
