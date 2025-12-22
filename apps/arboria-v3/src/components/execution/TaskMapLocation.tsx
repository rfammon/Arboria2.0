import type { GeolocationPosition } from '@/types/execution';
import { Card } from '@/components/ui/card';
import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

interface TaskMapLocationProps {
    targetLocation: { lat: number; lng: number };
    userLocation?: GeolocationPosition;
    showRoute?: boolean;
}

export function TaskMapLocation({
    targetLocation,
    userLocation
}: TaskMapLocationProps) {
    const mapStyle = "https://demotiles.maplibre.org/style.json";

    return (
        <Card className="rounded-md overflow-hidden h-[200px] w-full relative group">
            <Map
                initialViewState={{
                    longitude: targetLocation.lng,
                    latitude: targetLocation.lat,
                    zoom: 15
                }}
                style={{ width: '100%', height: '100%' }}
                mapLib={maplibregl}
                mapStyle={mapStyle}
                interactive={true}
            >
                <NavigationControl position="top-right" />

                {/* Tree/Task Location */}
                <Marker
                    longitude={targetLocation.lng}
                    latitude={targetLocation.lat}
                    color="#16a34a"
                />

                {/* User Location */}
                {userLocation && (
                    <Marker
                        longitude={userLocation.longitude}
                        latitude={userLocation.latitude}
                        color="#2563eb"
                    />
                )}
            </Map>

            <div className="absolute bottom-2 right-2">
                <Button size="sm" className="shadow-md gap-2" onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${targetLocation.lat},${targetLocation.lng}`, '_blank');
                }}>
                    <Navigation className="w-3 h-3" />
                    Navegar
                </Button>
            </div>
        </Card>
    );
}
