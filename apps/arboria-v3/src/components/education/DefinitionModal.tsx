import { X } from 'lucide-react';
import { useDefinition } from '../../context/DefinitionContext';

export function DefinitionModal() {
    const { isOpen, activeDefinition, closeDefinition } = useDefinition();

    if (!isOpen || !activeDefinition) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={closeDefinition}
            style={{
                // Ensure it covers everything, including potential other loose z-indexes
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 pr-4">
                        {activeDefinition.term}
                    </h3>
                    <button
                        onClick={closeDefinition}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {activeDefinition.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
