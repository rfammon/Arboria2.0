import { type Task } from '../../types/execution';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

type TaskCardProps = {
    task: Task;
    onAction: (task: Task) => void;
};

const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors = {
        LOW: 'bg-blue-100 text-blue-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HIGH: 'bg-orange-100 text-orange-800',
        CRITICAL: 'bg-red-100 text-red-800'
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[priority as keyof typeof colors] || 'bg-gray-100'}`}>
            {priority}
        </span>
    );
};

export default function TaskCard({ task, onAction }: TaskCardProps) {
    return (
        <Card className="mb-4 shadow-sm border-l-4 border-l-green-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardDescription className="text-xs font-mono">{task.id}</CardDescription>
                        <CardTitle className="text-lg font-bold text-gray-900 leading-tight mt-1">
                            {task.tree?.especie || 'Espécie Desconhecida'}
                        </CardTitle>
                    </div>
                    <PriorityBadge priority={task.priority} />
                </div>
            </CardHeader>

            <CardContent className="pb-2 text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="font-medium text-gray-900">{task.intervention_type}</span>
                </div>
                <p className="line-clamp-2">{task.description}</p>

                {task.tree && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <MapPin className="w-3 h-3" />
                        <span>ID Árvore: {task.tree.id.slice(0, 8)}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2">
                <Button
                    className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
                    onClick={() => onAction(task)}
                    disabled={task.status === 'COMPLETED'}
                >
                    {task.status === 'COMPLETED' ? 'Concluído' : 'Iniciar Execução'}
                </Button>
            </CardFooter>
        </Card>
    );
}
