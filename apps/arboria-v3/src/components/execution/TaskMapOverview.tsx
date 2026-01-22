import { useRef } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '@/components/theme-provider';
import type { Task } from '@/types/execution';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskMapOverviewProps {
    tasks: Task[];
    className?: string;
}

export default function TaskMapOverview({ tasks, className }: TaskMapOverviewProps) {
    const { theme } = useTheme();
    const mapContainer = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Default center (Campinas/SP region as generic fallback)
    const initialViewState = {
        longitude: -47.0608,
        latitude: -22.9068,
        zoom: 12
    };

    // Choose map style based on theme
    const mapStyle = theme === 'dark'
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    return (
        <div className={`relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border ${className}`} ref={mapContainer}>
            <Map
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle}
                attributionControl={false}
            >
                <GeolocateControl position="top-left" />
                <FullscreenControl position="top-left" />
                <NavigationControl position="top-left" />
                <ScaleControl />

                {tasks.map((task) => {
                    if (!task.tree_lat || !task.tree_lng) return null;

                    const color =
                        task.status === 'COMPLETED' ? '#22c55e' : // green-500
                            task.status === 'IN_PROGRESS' ? '#3b82f6' : // blue-500
                                task.priority === 'CRITICAL' ? '#ef4444' : // red-500
                                    task.priority === 'HIGH' ? '#f97316' : // orange-500
                                        '#94a3b8'; // slate-400

                    return (
                        <Marker
                            key={task.id}
                            longitude={task.tree_lng}
                            latitude={task.tree_lat}
                            color={color}
                            className="interactive-hover"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                // Could open a popup here
                            }}
                        >
                            <Popup
                                longitude={task.tree_lng}
                                latitude={task.tree_lat}
                                offset={25}
                                closeButton={false}
                                closeOnClick={false}
                                anchor="bottom"
                                className="z-10"
                            >
                                <div className="p-2 space-y-1 min-w-[150px]">
                                    <div className="font-bold text-sm truncate">{task.description}</div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] h-5">{task.status}</Badge>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => navigate(`/execution`)} // In a real app, maybe navigate to details or open modal
                                        >
                                            <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </Map>
        </div>
    );
}
