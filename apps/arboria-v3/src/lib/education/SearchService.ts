import Fuse from 'fuse.js';

export interface SearchResult {
    topicId: string;
    topicTitle: string;
    section: string;
    content: string;
    matchIndex?: number;
}

// Map of topics to their content file paths
const TOPICS = [
    { id: 'concepts', title: 'Conceitos Fundamentais', path: '/docs/education/content/concepts/index.md' },
    { id: 'pruning', title: 'Técnicas de Poda', path: '/docs/education/content/pruning/index.md' },
    { id: 'planning', title: 'Planejamento e Risco', path: '/docs/education/content/planning/index.md' },
    { id: 'safety', title: 'Segurança no Trabalho', path: '/docs/education/content/safety/index.md' },
    { id: 'preparation', title: 'Preparação e Ferramentas', path: '/docs/education/content/preparation/index.md' },
    { id: 'waste', title: 'Gestão de Resíduos', path: '/docs/education/content/waste/index.md' },
    { id: 'legal', title: 'Legislação e Normas', path: '/docs/education/content/legal/index.md' },
    { id: 'glossary', title: 'Glossário Técnico', path: '/docs/education/content/glossary/index.md' },
];

class SearchService {
    private index: Fuse<SearchResult> | null = null;
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized) return;

        const documents: SearchResult[] = [];

        // Fetch and parse all content
        for (const topic of TOPICS) {
            try {
                const response = await fetch(topic.path);
                const text = await response.text();
                const sections = this.parseSections(text);

                sections.forEach(section => {
                    documents.push({
                        topicId: topic.id,
                        topicTitle: topic.title,
                        section: section.title,
                        content: section.content
                    });
                });
            } catch (error) {
                console.error(`Error loading content for ${topic.title}:`, error);
            }
        }

        // Configure Fuse options
        const options = {
            keys: ['topicTitle', 'section', 'content'],
            includeScore: true,
            includeMatches: true,
            threshold: 0.3,
            minMatchCharLength: 3,
            ignoreLocation: true,
            useExtendedSearch: true,
        };

        this.index = new Fuse(documents, options);
        this.isInitialized = true;
    }

    private parseSections(markdown: string): { title: string; content: string }[] {
        const lines = markdown.split('\n');
        const sections: { title: string; content: string }[] = [];
        let currentTitle = 'Introdução';
        let currentContent: string[] = [];

        lines.forEach(line => {
            if (line.startsWith('## ')) {
                if (currentContent.length > 0) {
                    sections.push({
                        title: currentTitle.replace(/[#*]/g, '').trim(),
                        content: currentContent.join(' ').replace(/[#*_`]/g, '') // Clean markdown
                    });
                }
                currentTitle = line.replace('## ', '').trim();
                currentContent = [];
            } else if (line.startsWith('### ')) {
                // Treat h3 as part of content or sub-section, adding to current for now but marking usage
                currentContent.push(line.replace('### ', '').trim());
            } else {
                const cleanLine = line.trim();
                if (cleanLine) currentContent.push(cleanLine);
            }
        });

        // Push last section
        if (currentContent.length > 0) {
            sections.push({
                title: currentTitle.replace(/[#*]/g, '').trim(),
                content: currentContent.join(' ').replace(/[#*_`]/g, '')
            });
        }

        return sections;
    }

    search(query: string): SearchResult[] {
        if (!this.index) return [];

        // Normalize query
        const results = this.index.search(query);

        return results.map(result => ({
            ...result.item,
            matchIndex: result.matches?.[0]?.indices?.[0]?.[0]
        })).slice(0, 5); // Limit to top 5 results
    }
}

export const searchService = new SearchService();
