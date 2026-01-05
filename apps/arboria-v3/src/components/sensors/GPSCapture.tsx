/**
 * GPS Capture Component
 * Supports automatic GPS capture, manual Lat/Lon entry, and manual UTM entry
 */

import { useState, useEffect } from 'react';
import { useGPS } from '../../hooks/useGPS';
import { latLonToUTM, utmToLatLon, isValidUTM, UTM_ZONES_BRAZIL, UTM_ZONE_LETTERS } from '../../lib/coordinateUtils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MapPin, Loader2, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';

interface GPSCaptureProps {
    onCoordinatesCaptured: (coords: {
        easting: number;
        northing: number;
        zoneNum: number;
        zoneLetter: string;
        accuracy: number;
        latitude?: number;
        longitude?: number;
    }) => void;
}

export function GPSCapture({ onCoordinatesCaptured }: GPSCaptureProps) {
    const { coordinates, utmCoords, isSearching, bestAccuracy, samples, error, getPreciseLocation, stop, startAdvancedGPS, stopAdvancedGPS } = useGPS();

    // Manual entry state
    const [isManualMode, setIsManualMode] = useState(false);
    const [useAdvancedMode, setUseAdvancedMode] = useState(false);
    const [manualInputType, setManualInputType] = useState<'latlon' | 'utm'>('latlon');

    // Lat/Lon inputs
    const [manualLat, setManualLat] = useState('');
    const [manualLon, setManualLon] = useState('');

    // UTM inputs (padrão 23K)
    const [manualEasting, setManualEasting] = useState('');
    const [manualNorthing, setManualNorthing] = useState('');
    const [manualZoneNum, setManualZoneNum] = useState('23');
    const [manualZoneLetter, setManualZoneLetter] = useState('K');

    const [manualError, setManualError] = useState<string | null>(null);

    const handleAutoCapture = () => {
        if (isSearching) {
            stop();
            stopAdvancedGPS();
        } else if (utmCoords && coordinates) {
            onCoordinatesCaptured({
                easting: utmCoords.easting,
                northing: utmCoords.northing,
                zoneNum: utmCoords.utmZoneNum,
                zoneLetter: utmCoords.utmZoneLetter,
                accuracy: coordinates.accuracy,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            });
        } else {
            if (useAdvancedMode) {
                startAdvancedGPS();
            } else {
                getPreciseLocation();
            }
        }
    };

    // Auto-sync coordinates with parent form
    useEffect(() => {
        if (utmCoords && coordinates) {
            console.log('[GPSCapture] Auto-syncing coordinates to parent:', utmCoords);
            onCoordinatesCaptured({
                easting: utmCoords.easting,
                northing: utmCoords.northing,
                zoneNum: utmCoords.utmZoneNum,
                zoneLetter: utmCoords.utmZoneLetter,
                accuracy: coordinates.accuracy,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            });
        }
    }, [utmCoords, coordinates, onCoordinatesCaptured]);

    const handleManualLatLonSubmit = () => {
        setManualError(null);

        const lat = parseFloat(manualLat);
        const lon = parseFloat(manualLon);

        if (isNaN(lat) || isNaN(lon)) {
            setManualError('Por favor, insira coordenadas válidas');
            return;
        }

        if (lat < -90 || lat > 90) {
            setManualError('Latitude deve estar entre -90 e 90');
            return;
        }

        if (lon < -180 || lon > 180) {
            setManualError('Longitude deve estar entre -180 e 180');
            return;
        }

        const utm = latLonToUTM(lat, lon);
        if (!utm) {
            setManualError('Erro ao converter coordenadas para UTM');
            return;
        }

        onCoordinatesCaptured({
            easting: utm.easting,
            northing: utm.northing,
            zoneNum: utm.utmZoneNum,
            zoneLetter: utm.utmZoneLetter,
            accuracy: 0,
            latitude: lat,
            longitude: lon
        });

        setManualLat('');
        setManualLon('');
        setIsManualMode(false);
    };

    const handleManualUTMSubmit = () => {
        setManualError(null);

        const easting = parseFloat(manualEasting);
        const northing = parseFloat(manualNorthing);
        const zoneNum = parseInt(manualZoneNum);

        if (isNaN(easting) || isNaN(northing) || isNaN(zoneNum)) {
            setManualError('Por favor, insira coordenadas UTM válidas');
            return;
        }

        if (!isValidUTM(easting, northing, zoneNum)) {
            setManualError('Coordenadas UTM fora dos limites válidos');
            return;
        }

        const latLon = utmToLatLon(
            easting,
            northing,
            zoneNum,
            manualZoneLetter
        );

        if (!latLon) {
            setManualError('Erro ao converter coordenadas UTM');
            return;
        }

        onCoordinatesCaptured({
            easting: Math.round(easting),
            northing: Math.round(northing),
            zoneNum,
            zoneLetter: manualZoneLetter,
            accuracy: 0,
            latitude: latLon.latitude,
            longitude: latLon.longitude
        });

        setManualEasting('');
        setManualNorthing('');
        setIsManualMode(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Button
                    type="button"
                    onClick={() => setIsManualMode(false)}
                    variant={!isManualMode ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                >
                    <MapPin className="h-4 w-4 mr-1" />
                    Auto
                </Button>
                <Button
                    type="button"
                    onClick={() => setIsManualMode(true)}
                    variant={isManualMode ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Manual
                </Button>
            </div>

            {!isManualMode && (
                <>
                    <div className="flex items-center space-x-2 mb-2 px-1">
                        <input
                            type="checkbox"
                            id="advanced-mode"
                            checked={useAdvancedMode}
                            onChange={(e) => setUseAdvancedMode(e.target.checked)}
                            disabled={isSearching}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Label htmlFor="advanced-mode" className="text-sm text-gray-600 cursor-pointer">
                            Modo Avançado (Hatch Filter)
                        </Label>
                    </div>

                    {!utmCoords ? (
                        <Button
                            type="button"
                            onClick={handleAutoCapture}
                            variant="default"
                            className="w-full"
                            disabled={isSearching}
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {useAdvancedMode ? 'Refinando (Hatch Filter)...' : 'Buscando GPS...'}
                                    (±{bestAccuracy === Infinity ? '?' : bestAccuracy.toFixed(1)}m)
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {useAdvancedMode ? 'Iniciar Alta Precisão' : 'Capturar GPS Preciso'}
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 justify-start h-auto py-2 px-3"
                                disabled
                            >
                                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="text-left">
                                    {useAdvancedMode ? 'GPS Alta Precisão' : 'GPS Capturado'} (±{coordinates?.accuracy.toFixed(1)}m)
                                </span>
                            </Button>

                            <Button
                                type="button"
                                onClick={() => {
                                    if (useAdvancedMode) startAdvancedGPS();
                                    else getPreciseLocation();
                                }}
                                variant="outline"
                                className="sm:w-auto flex-1 h-auto py-2"
                                disabled={isSearching}
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Recapturar
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {utmCoords && !isSearching && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm mt-2">
                            <div className="font-semibold text-green-800 dark:text-green-300 mb-1">
                                Coordenadas UTM {useAdvancedMode && '(Smooth)'}
                            </div>
                            <div className="space-y-1 text-green-700 dark:text-green-400">
                                <div>E: {utmCoords.easting.toLocaleString()}m</div>
                                <div>N: {utmCoords.northing.toLocaleString()}m</div>
                                <div>Zona: {utmCoords.utmZoneNum}{utmCoords.utmZoneLetter}</div>
                                <div className="text-xs mt-1">Precisão: ±{coordinates?.accuracy.toFixed(1)}m</div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm flex gap-2 mt-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <span className="text-yellow-800 dark:text-yellow-300">{error}</span>
                        </div>
                    )}

                    {isSearching && !utmCoords && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300 mt-2">
                            <div className="font-semibold mb-1">
                                {useAdvancedMode ? 'Refinando com Carrier Phase...' : 'Aguardando sinal GPS preciso...'}
                            </div>
                            <div className="text-xs">
                                {useAdvancedMode
                                    ? 'Mantenha o dispositivo imóvel por ~20s para convergência.'
                                    : 'Alvo: < 5m de precisão (timeout: 20s)'}
                            </div>
                        </div>
                    )}

                    {isSearching && utmCoords && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300 mt-2">
                            <div className="font-semibold mb-1">Refinando Precisão...</div>
                            <div className="text-xs">
                                {useAdvancedMode
                                    ? `Amostras suavizadas: ${samples || 0}.`
                                    : `Coletando amostras: ${samples || 0}.`} Aguarde a estabilização.
                            </div>
                        </div>
                    )}
                </>
            )}

            {isManualMode && (
                <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Tabs value={manualInputType} onValueChange={(v: string) => setManualInputType(v as 'latlon' | 'utm')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="latlon">Lat/Lon</TabsTrigger>
                            <TabsTrigger value="utm">UTM</TabsTrigger>
                        </TabsList>

                        <TabsContent value="latlon" className="space-y-3">
                            <div>
                                <Label htmlFor="manual-lat">Latitude (°)</Label>
                                <Input
                                    id="manual-lat"
                                    type="number"
                                    step="0.000001"
                                    placeholder="-23.550520"
                                    value={manualLat}
                                    onChange={(e) => setManualLat(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="manual-lon">Longitude (°)</Label>
                                <Input
                                    id="manual-lon"
                                    type="number"
                                    step="0.000001"
                                    placeholder="-46.633308"
                                    value={manualLon}
                                    onChange={(e) => setManualLon(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={handleManualLatLonSubmit}
                                className="w-full"
                                disabled={!manualLat || !manualLon}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar Lat/Lon
                            </Button>
                        </TabsContent>

                        <TabsContent value="utm" className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="manual-zone">Zona</Label>
                                    <Select value={manualZoneNum} onValueChange={setManualZoneNum}>
                                        <SelectTrigger id="manual-zone" className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UTM_ZONES_BRAZIL.map(zone => (
                                                <SelectItem key={zone.num} value={zone.num.toString()}>
                                                    {zone.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="manual-zone-letter">Letra</Label>
                                    <Select value={manualZoneLetter} onValueChange={setManualZoneLetter}>
                                        <SelectTrigger id="manual-zone-letter" className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UTM_ZONE_LETTERS.map(letter => (
                                                <SelectItem key={letter} value={letter}>
                                                    {letter}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="manual-easting">Easting (m)</Label>
                                <Input
                                    id="manual-easting"
                                    type="number"
                                    step="1"
                                    placeholder="323000"
                                    value={manualEasting}
                                    onChange={(e) => setManualEasting(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="manual-northing">Northing (m)</Label>
                                <Input
                                    id="manual-northing"
                                    type="number"
                                    step="1"
                                    placeholder="7395000"
                                    value={manualNorthing}
                                    onChange={(e) => setManualNorthing(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={handleManualUTMSubmit}
                                className="w-full"
                                disabled={!manualEasting || !manualNorthing}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar UTM
                            </Button>
                        </TabsContent>
                    </Tabs>

                    {manualError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm flex gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-red-800 dark:text-red-300">{manualError}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
