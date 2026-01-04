
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMyTasks } from '../hooks/useExecution';
import { useAuth } from '../context/AuthContext';
import { TaskExecutionCard } from '../components/execution/TaskExecutionCard';
import TaskExecutionForm from '../components/execution/TaskExecutionForm';
import { SOSButton } from '../components/execution/SOSButton';
import { PlanChangeNotification } from '../components/execution/PlanChangeNotification';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useInstallationMembers } from '../hooks/useInstallation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Search, RefreshCw, Layers, Play, AlertCircle, CheckCircle, XCircle, FolderOpen, Users } from 'lucide-react';
import type { Task, TaskStatus } from '../types/execution';
import { Badge } from '@/components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

export default function Execution() {
    const { user, activeInstallation, activeProfileNames } = useAuth();
    const { data: tasks, isLoading, refetch } = useMyTasks(user?.id, activeInstallation?.id);
    const { data: members } = useInstallationMembers(activeInstallation?.id);

    // Permission check for manager view
    const isManager = activeProfileNames?.includes('Gestor') || activeProfileNames?.includes('Planejador') || activeProfileNames?.includes('Mestre');

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [activeTab, setActiveTab] = useState("pendentes");

    // Scroll to top on tab change for better visibility
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    const handleStart = (task: Task) => {
        setSelectedTaskId(task.id);
        setIsFormOpen(true);
    };

    const handleContinue = (task: Task) => {
        setSelectedTaskId(task.id);
        setIsFormOpen(true);
    };

    const handleViewDetails = (task: Task) => {
        setSelectedTaskId(task.id);
        setIsFormOpen(true);
    };

    const handleReportIssue = (task: Task) => {
        alert(`Reportar problema na tarefa: ${task.intervention_type}\n\nFuncionalidade em desenvolvimento. Para emergências, use o botão SOS.`);
    };

    const getFilteredTasks = (status: TaskStatus) => {
        return tasks?.filter(task => {
            const matchesSearch =
                (task.intervention_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.tree?.especie || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.id || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesUser = selectedUser === 'all' || task.assigned_to === selectedUser;

            return task.status === status && matchesSearch && matchesUser;
        }) || [];
    };

    // UI Components for Empty States
    const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-4">
            <div className="bg-white p-4 rounded-full shadow-sm ring-1 ring-slate-100">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <div className="max-w-xs">
                <p className="text-slate-600 font-medium">{message}</p>
                {searchQuery && (
                    <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2 text-primary">
                        Limpar busca
                    </Button>
                )}
            </div>
        </div>
    );

    const renderTaskList = (status: TaskStatus, emptyMessage: string, emptyIcon: any) => {
        const list = getFilteredTasks(status);

        if (isLoading) {
            return (
                <div className="space-y-4 mt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            );
        }

        if (list.length === 0) {
            return <EmptyState message={emptyMessage} icon={emptyIcon} />;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 mt-6 animate-in fade-in duration-500">
                {list.map((task, index) => (
                    <TaskExecutionCard
                        key={task.id || `task-${index}`}
                        task={task}
                        onStart={() => handleStart(task)}
                        onContinue={() => handleContinue(task)}
                        onViewDetails={() => handleViewDetails(task)}
                        onReportIssue={() => handleReportIssue(task)}
                    />
                ))}
            </div>
        );
    };

    const counts = {
        NOT_STARTED: getFilteredTasks('NOT_STARTED').length,
        IN_PROGRESS: getFilteredTasks('IN_PROGRESS').length,
        BLOCKED: getFilteredTasks('BLOCKED').length,
        COMPLETED: getFilteredTasks('COMPLETED').length,
        CANCELLED: getFilteredTasks('CANCELLED').length,
    };

    // Custom Tab Trigger Component for consistent styling
    const TabPill = ({ value, label, icon: Icon, count }: any) => (
        <TabsTrigger
            value={value}
            className={cn(
                "flex items-center gap-1.5 rounded-xl border border-white/10 bg-card/50 px-3 py-2 text-muted-foreground shadow-sm transition-all",
                "data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105",
                "hover:bg-muted/50 hover:text-foreground shrink-0"
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">{label}</span>
            {count > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 h-4 min-w-[16px] justify-center text-[9px] bg-slate-100 text-slate-600 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                    {count}
                </Badge>
            )}
        </TabsTrigger>
    );

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header Section */}
            <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-white/10 shadow-[var(--shadow-soft)]">
                <div className="max-w-[100%] mx-auto px-6 py-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight font-display text-foreground">
                                {isManager ? 'Tarefas da Instalação' : 'Minhas Tarefas'}
                            </h1>
                            <p className="text-xs text-muted-foreground font-medium">
                                {activeInstallation?.nome || 'Instalação não selecionada'}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => refetch()}
                            className={cn("text-slate-500 hover:text-primary hover:bg-primary/5", isLoading && "animate-spin")}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 relative">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar ordem de serviço..."
                                className="pl-10 bg-muted/40 border-border/50 focus:bg-background transition-all h-10 rounded-xl shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {isManager && (
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger className="w-full sm:w-[200px] bg-muted/40 border-border/50 h-10 rounded-xl justify-start gap-2.5">
                                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                                    <span className="truncate text-sm">
                                        {selectedUser === 'all'
                                            ? 'Todos'
                                            : members?.find((m: any) => m.user_id === selectedUser)?.nome
                                            || members?.find((m: any) => m.user_id === selectedUser)?.email
                                            || 'Executante'}
                                    </span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {members?.map((m: any) => (
                                        <SelectItem key={m.user_id} value={m.user_id}>
                                            {m.nome || m.email?.split('@')[0]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[100%] mx-auto px-6 py-8">
                <Tabs defaultValue="pendentes" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
                    <div className="w-full">
                        <TabsList className="flex flex-nowrap overflow-x-auto h-auto p-1 gap-2 bg-transparent no-scrollbar justify-start md:justify-between">
                            <TabPill value="pendentes" label="Pendentes" icon={Layers} count={counts.NOT_STARTED} />
                            <TabPill value="andamento" label="Executando" icon={Play} count={counts.IN_PROGRESS} />
                            <TabPill value="paralisadas" label="Paradas" icon={AlertCircle} count={counts.BLOCKED} />
                            <TabPill value="concluidas" label="Concluídas" icon={CheckCircle} count={counts.COMPLETED} />
                            <TabPill value="canceladas" label="Canceladas" icon={XCircle} count={counts.CANCELLED} />
                        </TabsList>
                    </div>

                    <TabsContent value="pendentes" className="mt-0 focus-visible:ring-0">
                        {renderTaskList('NOT_STARTED', 'Você não tem tarefas pendentes no momento.', FolderOpen)}
                    </TabsContent>

                    <TabsContent value="andamento" className="mt-0 focus-visible:ring-0">
                        {renderTaskList('IN_PROGRESS', 'Nenhuma tarefa em execução.', Play)}
                    </TabsContent>

                    <TabsContent value="paralisadas" className="mt-0 focus-visible:ring-0">
                        {renderTaskList('BLOCKED', 'Nenhuma tarefa paralisada.', AlertCircle)}
                    </TabsContent>

                    <TabsContent value="concluidas" className="mt-0 focus-visible:ring-0">
                        {renderTaskList('COMPLETED', 'Nenhuma tarefa concluída recentemente.', CheckCircle)}
                    </TabsContent>

                    <TabsContent value="canceladas" className="mt-0 focus-visible:ring-0">
                        {renderTaskList('CANCELLED', 'Histórico de cancelamentos vazio.', XCircle)}
                    </TabsContent>
                </Tabs>
            </div>

            <TaskExecutionForm
                taskId={selectedTaskId}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
            />

            {user && <SOSButton userId={user.id} />}
            <PlanChangeNotification />
        </div >
    );
}

