import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { AlertCircle, CheckCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';

import { useDefinition } from '../../context/DefinitionContext';



interface ContentViewerProps {
    content: string;
}

export function ContentViewer({ content }: ContentViewerProps) {
    // Hook MUST be called at the top level, not inside callbacks
    const { openDefinition } = useDefinition();

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none educational-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Handle Tooltip links: [Term](tooltip:Definition)
                    a: ({ href, children }: any) => {
                        if (href && href.startsWith('tooltip:')) {
                            const tooltipText = decodeURIComponent(href.replace('tooltip:', ''));
                            // We need to access the text content of the children, effectively the 'Term'
                            const term = children && children.toString ? children.toString() : 'Definição';

                            return (
                                <span
                                    className="cursor-pointer border-b border-dashed border-blue-500 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Detach to be safe
                                        setTimeout(() => {
                                            openDefinition(term, tooltipText);
                                        }, 10);
                                    }}
                                >
                                    {children}
                                </span>
                            );
                        }
                        return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                {children}
                            </a>
                        );
                    },

                    // Custom blockquote rendering for callouts
                    blockquote: ({ children }) => {
                        const text = String(children);

                        // Detect callout type from emoji/marker
                        if (text.includes('⚠️') || text.includes('**Atenção:**')) {
                            return (
                                <div className="my-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (text.includes('✅') || text.includes('**Checklist:**')) {
                            return (
                                <div className="my-4 rounded-lg border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
                                    <div className="flex gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-green-800 dark:text-green-200">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (text.includes('💡') || text.includes('**Dica:**')) {
                            return (
                                <div className="my-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4">
                                    <div className="flex gap-3">
                                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-800 dark:text-blue-200">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (text.includes('🚨') || text.includes('**Urgente:**')) {
                            return (
                                <div className="my-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-800 dark:text-red-200">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Default blockquote
                        return (
                            <div className="my-4 rounded-lg border-l-4 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {children}
                                    </div>
                                </div>
                            </div>
                        );
                    },

                    // Tables with responsive wrapper
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                {children}
                            </table>
                        </div>
                    ),

                    thead: ({ children }) => (
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            {children}
                        </thead>
                    ),

                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {children}
                        </td>
                    ),

                    // Code blocks with better styling
                    code: ({ inline, className, children }: any) => {
                        if (inline) {
                            return (
                                <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-pink-600 dark:text-pink-400">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={className}>
                                {children}
                            </code>
                        );
                    },

                    // Headings with anchor links
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
                            {children}
                        </h1>
                    ),

                    h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                            {children}
                        </h2>
                    ),

                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
                            {children}
                        </h3>
                    ),

                    // Lists with custom styling
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
                            {children}
                        </ol>
                    ),

                    // Checkboxes for checklists
                    input: ({ checked, type }) => {
                        if (type === 'checkbox') {
                            return (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                            );
                        }
                        return null;
                    },
                }}
            >
                {content.replace(/\[([^\]]+)\]\(tooltip:([^\)]+)\)/g, (_, text, tooltip) => {
                    // Encode the tooltip content to make it a valid URL
                    return `[${text}](tooltip:${encodeURIComponent(tooltip)})`;
                })}
            </ReactMarkdown>

            {/* Print-friendly styles */}
            <style>{`
        @media print {
          .prose {
            max-width: 100%;
            font-size: 10pt;
          }
          
          .prose blockquote {
            page-break-inside: avoid;
          }
          
          .prose table {
            font-size: 9pt;
          }
          
          .prose h1, .prose h2, .prose h3 {
            page-break-after: avoid;
          }
        }
      `}</style>
        </div>
    );
}
