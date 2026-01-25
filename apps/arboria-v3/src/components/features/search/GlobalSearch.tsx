import * as React from "react"
import {
    LayoutDashboard,
    ClipboardList,
    Map as MapIcon,
    Settings,
    Trees,
    FileText,
    Search as SearchIcon,
    X,
    ChevronRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../ui/command"
import { useTrees } from "../../../hooks/useTrees"
import { searchService } from "../../../lib/education/SearchService"
import { cn } from "../../../lib/utils"

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const navigate = useNavigate()
    const { data: trees } = useTrees()
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Fechar ao clicar fora
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Atalho teclado
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(true)
                // Usar um pequeno timeout para garantir que o dropdown abriu antes de focar
                setTimeout(() => {
                    containerRef.current?.querySelector("input")?.focus()
                }, 10)
            }
            if (e.key === "Escape") {
                setOpen(false)
            }
        }
        document.addEventListener("keydown", down)
        searchService.initialize();
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        setSearch("")
        command()
    }, [])

    const educationResults = React.useMemo(() => {
        if (!search || search.length < 2) return []
        return searchService.search(search)
    }, [search])

    return (
        <div className="relative w-full md:w-72 lg:w-96" ref={containerRef}>
            <Command className="bg-transparent overflow-visible" shouldFilter={true}>
                {/* Barra de Busca (Integrada ao Command) */}
                <div className={cn(
                    "flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2 transition-all duration-300 border border-white/5 shadow-sm focus-within:bg-background focus-within:border-primary/20",
                    open ? "bg-background border-primary/20" : "hover:bg-muted/60"
                )}>
                    <CommandInput
                        value={search}
                        onValueChange={(v) => {
                            setSearch(v)
                            if (!open) setOpen(true)
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder="Pesquisar..."
                        className="h-auto border-none p-0 focus-visible:ring-0 flex-1 bg-transparent text-sm md:text-base"
                    />
                    {search ? (
                        <button 
                            onPointerDown={(e) => e.preventDefault()} // Evita perda de foco no input
                            onClick={(e) => {
                                e.stopPropagation();
                                setSearch("");
                            }} 
                            className="text-muted-foreground hover:text-foreground p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded-md border bg-muted/50 px-2 font-mono text-[11px] font-medium text-muted-foreground md:flex">
                            Ctrl+K
                        </kbd>
                    )}
                </div>

                {/* Dropdown de Resultados (Bento/Glassmorphism) */}
                <AnimatePresence mode="wait">
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.99 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.99 }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 z-[100] mt-1 overflow-hidden rounded-2xl border border-white/5 bg-card/95 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] pointer-events-auto"
                        >
                            <CommandList className="max-h-[500px] p-2 scrollbar-hide">
                                <CommandEmpty className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <SearchIcon className="h-8 w-8 text-muted-foreground/20" />
                                        <p className="text-sm text-muted-foreground font-medium">Nenhum resultado para "{search}"</p>
                                    </div>
                                </CommandEmpty>

                                <CommandGroup heading="Ações Rápidas" className="px-2">
                                    <div className="grid grid-cols-2 gap-3 mt-3 mb-4">
                                        <QuickAction 
                                            icon={<LayoutDashboard className="h-5 w-5 text-blue-400" />}
                                            label="Painel"
                                            onClick={() => runCommand(() => navigate("/"))}
                                        />
                                        <QuickAction 
                                            icon={<ClipboardList className="h-5 w-5 text-emerald-400" />}
                                            label="Inventário"
                                            onClick={() => runCommand(() => navigate("/inventory"))}
                                        />
                                    </div>
                                </CommandGroup>

                                {((trees && trees.length > 0) || educationResults.length > 0) && (
                                    <div className="h-px bg-white/5 mx-4 my-2" />
                                )}

                                {trees && trees.length > 0 && (
                                    <CommandGroup heading="Árvores Recentes" className="px-2">
                                        <div className="space-y-1.5 mt-2">
                                            {trees.slice(0, 5).map((tree) => (
                                                <SearchItem
                                                    key={tree.id}
                                                    icon={<Trees className="h-5 w-5 text-emerald-500" />}
                                                    title={tree.codigo || 'Sem Código'}
                                                    subtitle={tree.especie || 'Espécie não identificada'}
                                                    onClick={() => runCommand(() => navigate(`/inventory/${tree.id}`))}
                                                    value={`${tree.codigo} ${tree.especie}`}
                                                />
                                            ))}
                                        </div>
                                    </CommandGroup>
                                )}

                                {educationResults.length > 0 && (
                                    <>
                                        <div className="h-px bg-white/5 mx-4 my-4" />
                                        <CommandGroup heading="Guia de Manejo" className="px-2">
                                            <div className="space-y-1.5 mt-2">
                                                {educationResults.map((result, idx) => (
                                                    <SearchItem
                                                        key={`${result.topicId}-${idx}`}
                                                        icon={<FileText className="h-5 w-5 text-orange-400" />}
                                                        title={result.topicTitle}
                                                        subtitle={result.section}
                                                        onClick={() => runCommand(() => navigate(`/education/topic/${result.topicId}`))}
                                                        value={result.content}
                                                    />
                                                ))}
                                            </div>
                                        </CommandGroup>
                                    </>
                                )}

                                <div className="h-px bg-white/5 mx-4 my-4" />
                                <CommandGroup heading="Sistema" className="px-2">
                                    <div className="space-y-1.5 mt-2">
                                        <SearchItem 
                                            icon={<MapIcon className="h-5 w-5 text-indigo-400" />}
                                            title="Mapa Arborizado"
                                            subtitle="Gestão geoespacial"
                                            onClick={() => runCommand(() => navigate("/map"))}
                                        />
                                        <SearchItem 
                                            icon={<Settings className="h-5 w-5 text-slate-400" />}
                                            title="Ajustes"
                                            subtitle="Configurações da conta"
                                            onClick={() => runCommand(() => navigate("/settings"))}
                                        />
                                    </div>
                                </CommandGroup>
                            </CommandList>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Command>
        </div>
    )
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <CommandItem
            onSelect={onClick}
            onPointerDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3 transition-all hover:bg-white/[0.08] hover:border-white/10 cursor-pointer aria-selected:bg-white/[0.08] aria-selected:border-white/10 group"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 group-hover:scale-110 transition-transform shadow-inner">
                {icon}
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground/90">{label}</span>
        </CommandItem>
    )
}

function SearchItem({ icon, title, subtitle, onClick, value }: { icon: React.ReactNode, title: string, subtitle: string, onClick: () => void, value?: string }) {
    return (
        <CommandItem
            onSelect={onClick}
            onPointerDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            value={value}
            className="group flex items-center gap-4 rounded-xl p-2.5 transition-all hover:bg-white/[0.05] aria-selected:bg-white/[0.05] cursor-pointer"
        >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-muted-foreground group-hover:scale-110 transition-transform border border-white/5">
                {icon}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden gap-1">
                <span className="truncate text-sm font-bold text-foreground/90">{title}</span>
                <span className="truncate text-xs text-muted-foreground/60 font-medium leading-none">{subtitle}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </CommandItem>
    )
}

