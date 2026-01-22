import { TreeDeciduous, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

interface PlanTreeInfoProps {
    tree?: {
        id: string;
        especie?: string;
        codigo?: string;
        local?: string;
        risklevel?: string;
        latitude?: number;
        longitude?: number;
    };
    onNavigate: (lat: number, lng: number) => void;
}

export function PlanTreeInfo({ tree, onNavigate }: PlanTreeInfoProps) {
    return (
        <Card className="border-l-4 border-emerald-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TreeDeciduous className="w-5 h-5 text-emerald-600" />
                    Árvore Alvo
                </CardTitle>
            </CardHeader>
            <CardContent>
                {tree ? (
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
                            <TreeDeciduous className="w-8 h-8 opacity-30" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{tree.especie || 'Espécie não identificada'}</h3>
                            <p className="text-sm text-muted-foreground">ID: {tree.id}</p>
                            {tree.codigo && (
                                <p className="text-sm text-muted-foreground">Código: {tree.codigo}</p>
                            )}
                            {tree.local && (
                                <p className="text-sm">Local: {tree.local}</p>
                            )}
                            {tree.latitude && tree.longitude && (
                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        onClick={() => onNavigate(tree.latitude!, tree.longitude!)}
                                    >
                                        <Navigation className="w-3.5 h-3.5 mr-2" />
                                        Navegar até a Árvore
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-yellow-600 flex items-center gap-2">
                        <span>Este plano ainda não está vinculado a uma árvore específica.</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
