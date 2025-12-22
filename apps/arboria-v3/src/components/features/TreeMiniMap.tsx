import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { satelliteStyle } from '../../lib/map/mapStyles';
import { Trees as TreeIcon } from 'lucide-react';
import maplibregl from 'maplibre-gl';

interface TreeMiniMapProps {
    latitude: number;
    longitude: number;
    species?: string;
}

export default function TreeMiniMap({ latitude, longitude, species }: TreeMiniMapProps) {
    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-border shadow-sm">
            <Map
                mapLib={maplibregl}
                initialViewState={{
                    longitude: longitude,
                    latitude: latitude,
                    zoom: 17,
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={satelliteStyle as any}
                attributionControl={false}
            >
                <Marker longitude={longitude} latitude={latitude} anchor="bottom">
                    <div
                        className="bg-primary/90 p-1.5 rounded-full border-2 border-white shadow-lg"
                        title={species}
                    >
                        <TreeIcon className="w-4 h-4 text-white" />
                    </div>
                </Marker>
            </Map>
        </div>
    );
}
