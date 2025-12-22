import React from 'react';
import { Locate, LocateFixed, LocateOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useBatteryMonitor } from '@/hooks/useBatteryMonitor';
import { cn } from '@/lib/utils';

/**
 * LocationButton Component
 * 
 * Toggle button for GPS user location tracking.
 * Epic 8: GPS User Location Tracking
 * 
 * Features:
 * - Visual state feedback (off/loading/active/error)
 * - Battery impact indicator
 * - Accuracy indicator
 * - Tooltips
 */

interface LocationButtonProps {
    onLocationChange?: (location: { lat: number; lon: number } | null) => void;
    className?: string;
}

export function LocationButton({ onLocationChange, className }: LocationButtonProps) {
    const { location, state, isTracking, error, startTracking, stopTracking } = useUserLocation();
    const { batteryImpact, batteryStatus } = useBatteryMonitor(isTracking);

    // Notify parent of location changes
    React.useEffect(() => {
        if (location && onLocationChange) {
            onLocationChange({
                lat: location.latitude,
                lon: location.longitude,
            });
        } else if (!location && onLocationChange) {
            onLocationChange(null);
        }
    }, [location, onLocationChange]);

    const handleClick = () => {
        if (isTracking) {
            stopTracking();
        } else {
            startTracking();
        }
    };

    // Icon based on state
    const renderIcon = () => {
        switch (state) {
            case 'loading':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'active':
                return <LocateFixed className="h-4 w-4" />;
            case 'error':
                return <LocateOff className="h-4 w-4" />;
            default:
                return <Locate className="h-4 w-4" />;
        }
    };

    // Variant based on state
    const getVariant = () => {
        switch (state) {
            case 'active':
                return 'default';
            case 'error':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Battery impact badge
    const renderBatteryBadge = () => {
        if (!isTracking || !batteryStatus) return null;

        const colors = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-red-500',
        };

        return (
            <div
                className={cn(
                    'absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background',
                    colors[batteryImpact]
                )}
                title={`Impacto de bateria: ${batteryImpact === 'low' ? 'Baixo' : batteryImpact === 'medium' ? 'Médio' : 'Alto'}`}
            />
        );
    };

    // Accuracy indicator
    const renderAccuracy = () => {
        if (!location || state !== 'active') return null;

        return (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap bg-background/80 px-1 rounded">
                ±{Math.round(location.accuracy)}m
            </div>
        );
    };

    return (
        <div className="relative">
            <Button
                variant={getVariant()}
                size="icon"
                onClick={handleClick}
                className={cn('relative', className)}
                title={
                    state === 'off'
                        ? 'Ativar rastreamento GPS'
                        : state === 'loading'
                            ? 'Obtendo localização...'
                            : state === 'active'
                                ? 'Desativar rastreamento GPS'
                                : error || 'Erro GPS'
                }
            >
                {renderIcon()}
                {renderBatteryBadge()}
            </Button>
            {renderAccuracy()}
        </div>
    );
}
