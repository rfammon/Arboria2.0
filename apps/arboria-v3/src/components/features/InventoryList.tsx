import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTrees } from '../../hooks/useTrees';
import { useTreeMutations } from '../../hooks/useTreeMutations';
import type { Tree } from '../../types/tree';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal, Trees as TreesIcon, Trash2, Edit, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { FieldAction } from '../common/FieldAction';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { useDensity } from '../../hooks/useDensity';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface InventoryListProps {
    onCreate?: () => void;
}

export default function InventoryList({ onCreate }: InventoryListProps) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: trees, isLoading, error } = useTrees();
    const { deleteTree } = useTreeMutations();
    const [sorting, setSorting] = useState<SortingState>([]);
    const density = useDensity();

    // Deletion State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSelectRow = (id: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('selectedTree', id);
        setSearchParams(newParams);
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deleteTree.mutateAsync(deleteId);
            setDeleteId(null);
        }
    };

    const getRiskStyles = (level: string) => {
        const l = (level || '').toLowerCase();
        if (l === 'extremo') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        if (l === 'alto') return 'bg-destructive/15 text-destructive dark:bg-destructive/30';
        if (l === 'moderado') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        if (l === 'baixo') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }: any) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id').slice(0, 8)}</span>,
        },
        {
            accessorKey: 'especie',
            header: ({ column }: any) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-4 text-muted-foreground hover:text-foreground"
                    >
                        Espécie
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }: any) => <div className="font-medium">{row.getValue('especie')}</div>,
        },
        {
            accessorKey: 'data',
            header: 'Data',
            cell: ({ row }: any) => format(new Date(row.getValue('data')), 'dd/MM/yyyy'),
        },
        {
            accessorKey: 'pontuacao',
            header: 'Risco',
            cell: ({ row }: any) => {
                const riskLevel = (row.original as Tree).risklevel || 'Não Avaliado';
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${getRiskStyles(riskLevel)}
                    `}>
                        {riskLevel}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const tree = row.original as Tree;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                <span className="sr-only">Menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/inventory/${tree.id}`);
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Detalhes e Edição
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(tree.id);
                                }}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: trees || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
        },
    });

    if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Carregando inventário...</div>;
    if (error) return <div className="p-8 text-destructive text-center">Erro ao carregar dados.</div>;

    if (!trees?.length) return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <TreesIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma árvore encontrada</p>
            <div className="mt-6">
                <FieldAction
                    isPrimary
                    onClick={() => onCreate && onCreate()}
                >
                    Adicionar Árvore
                </FieldAction>
            </div>
        </div>
    );

    // Mobile View: Cards
    if (density === 'field') {
        return (
            <div className="space-y-3 p-3">
                {trees.map((tree) => (
                    <Card
                        key={tree.id}
                        onClick={() => handleSelectRow(tree.id)}
                        className="active:scale-[0.98] transition-transform"
                    >
                        <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    {tree.especie}
                                </CardTitle>
                                <div className="text-xs text-muted-foreground font-mono mt-1">
                                    ID: {tree.id.slice(0, 8)}
                                </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                ${getRiskStyles(tree.risklevel || 'Não Avaliado')}
                            `}>
                                {tree.risklevel || 'N/A'}
                            </span>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {tree.data ? format(new Date(tree.data), 'dd/MM/yyyy') : '-'}
                                    </span>
                                    {tree.altura && (
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold">{tree.altura}</span>m
                                        </span>
                                    )}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={e => e.stopPropagation()}>
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/inventory/${tree.id}`)}>
                                            <Edit className="w-4 h-4 mr-2" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setDeleteId(tree.id)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Mobile Deletion Dialog */}
                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent className="w-[90vw] rounded-lg">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Árvore?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    // Desktop View: Table
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <th key={header.id} className="h-10 px-4 align-middle font-medium text-muted-foreground whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-border">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => handleSelectRow((row.original as Tree).id)}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-4 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Sem resultados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Próximo
                </Button>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Árvore?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A árvore será permanentemente removida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
