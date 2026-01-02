
import * as React from "react"
import {
    LayoutDashboard,
    ClipboardList,
    Map as MapIcon,
    GraduationCap,
    Settings,
    Trees,
    FileText,
    Search as SearchIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "../../ui/command"
import { useTrees } from "../../../hooks/useTrees"
import { searchService } from "../../../lib/education/SearchService"

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const navigate = useNavigate()
    const { data: trees } = useTrees()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)

        // Initialize search service for education content
        searchService.initialize();

        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    // Filter education content based on the search query
    const educationResults = React.useMemo(() => {
        if (!search || search.length < 2) return []
        return searchService.search(search)
    }, [search])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 transition-all hover:bg-muted md:w-40 lg:w-64 border border-transparent hover:border-border"
            >
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground hidden md:inline-block">Pesquisar...</span>
                <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="O que você está procurando?"
                    value={search}
                    onValueChange={setSearch}
                />
                <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                    <CommandGroup heading="Sugestões">
                        <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/inventory"))}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            <span>Inventário Profissional</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/map"))}>
                            <MapIcon className="mr-2 h-4 w-4" />
                            <span>Mapa de Intervenções</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/education"))}>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            <span>Educação & Treinamento</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    {trees && trees.length > 0 && (
                        <CommandGroup heading="Árvores (Inventário)">
                            {trees.slice(0, 5).map((tree) => (
                                <CommandItem
                                    key={tree.id}
                                    onSelect={() => runCommand(() => navigate(`/inventory/${tree.id}`))}
                                    value={`${tree.codigo} ${tree.especie}`}
                                >
                                    <Trees className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{tree.codigo || 'Sem Código'}</span>
                                        <span className="text-xs text-muted-foreground">{tree.especie || 'Espécie não identificada'}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {educationResults.length > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup heading="Conteúdo Educativo">
                                {educationResults.map((result, idx) => (
                                    <CommandItem
                                        key={`${result.topicId}-${idx}`}
                                        onSelect={() => runCommand(() => navigate(`/education/topic/${result.topicId}`))}
                                        value={result.content}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{result.topicTitle}</span>
                                            <span className="text-xs text-muted-foreground line-clamp-1">{result.section}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}

                    <CommandSeparator />

                    <CommandGroup heading="Configurações">
                        <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Perfil & Preferências</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
