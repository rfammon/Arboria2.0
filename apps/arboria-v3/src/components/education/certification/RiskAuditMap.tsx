import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface HazardZone {
    id: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    radius: number; // Percentage radius
    description: string;
}

interface RiskAuditMapProps {
    imageSrc: string;
    zones: HazardZone[];
    onComplete: (passed: boolean) => void;
}

export function RiskAuditMap({ imageSrc, zones, onComplete }: RiskAuditMapProps) {
    const [foundZones, setFoundZones] = useState<string[]>([]);
    const [lastFound, setLastFound] = useState<string | null>(null);
    const [misses, setMisses] = useState(0);

    const isComplete = foundZones.length === zones.length;

    const handleZoneClick = (zoneId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent background click
        if (foundZones.includes(zoneId)) return;

        setFoundZones(prev => [...prev, zoneId]);
        setLastFound(zoneId);
    };

    const handleBackgroundClick = () => {
        setMisses(prev => prev + 1);
        setLastFound(null); // Clear last found message to show "Miss" feedback if we want, or just generic
    };

    const getZoneStyle = (zone: HazardZone) => ({
        left: `${zone.x}% `,
        top: `${zone.y}% `,
        width: `${zone.radius * 2}% `,
        height: `${zone.radius * 2}% `,
    });

    return (
        <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-white">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-gray-900">Auditoria de Risco Visual</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-700">
                            Riscos: {foundZones.length} / {zones.length}
                        </span>
                        {isComplete && <CheckCircle2 className="text-green-600 w-6 h-6 animate-in zoom-in" />}
                    </div>
                </div>
                <CardDescription className="text-gray-800 dark:text-gray-800">
                    Identifique todos os riscos na imagem clicando sobre eles. Cuidado com falsos positivos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-crosshair border-2 border-gray-200 dark:border-gray-700"
                    onClick={handleBackgroundClick}
                >
                    <img
                        src={imageSrc}
                        alt="Local de Trabalho"
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    />

                    {/* Zones */}
                    {zones.map(zone => {
                        const isFound = foundZones.includes(zone.id);
                        return (
                            <button
                                key={zone.id}
                                aria-label={zone.description}
                                onClick={(e) => handleZoneClick(zone.id, e)}
                                className={`absolute rounded - full transform - translate - x - 1 / 2 - translate - y - 1 / 2 transition - all duration - 500 border - 2 ${isFound
                                    ? 'bg-red-500/40 border-red-500 animate-pulse'
                                    : 'bg-transparent border-transparent hover:bg-white/10' // Debug hint on hover? Maybe explicit debug mode only
                                    } `}
                                style={getZoneStyle(zone)}
                            />
                        );
                    })}
                </div>

                {/* Feedback Area */}
                <div className="mt-4 h-16 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div>
                        {lastFound ? (
                            <div className="text-red-700 font-medium flex items-center animate-in slide-in-from-left">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Risco Encontrado: {zones.find(z => z.id === lastFound)?.description}
                            </div>
                        ) : misses > 0 ? (
                            <div className="text-gray-500 text-sm">
                                Nada detectado nessa área. ({misses} tentativas falhas)
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">Toque nos pontos de risco...</div>
                        )}
                    </div>

                    {isComplete ? (
                        <Button onClick={() => onComplete(true)} className="bg-green-600 hover:bg-green-700 text-white animate-in fade-in">
                            Concluir Auditoria
                        </Button>
                    ) : (
                        <span className="text-xs text-gray-400">Encontre {zones.length - foundZones.length} restantes</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
