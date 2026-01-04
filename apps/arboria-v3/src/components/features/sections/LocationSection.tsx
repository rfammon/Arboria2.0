import { MapPin } from 'lucide-react';
import { Input } from '../../ui/input';
import { GPSCapture } from '../../sensors/GPSCapture';

interface LocationSectionProps {
    register: any;
    setValue: any;
}

export function LocationSection({
    register,
    setValue
}: LocationSectionProps) {
    return (
        <div className="space-y-6 pt-6 border-t border-border/50">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Localização & Geoprocessamento
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Coordenadas geográficas da árvore
                    </p>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-muted/20 p-5 rounded-xl border border-border/50 space-y-5">
                {/* GPS Capture */}
                <div className="bg-background/50 p-4 rounded-lg border border-border/30">
                    <GPSCapture
                        onCoordinatesCaptured={(coords: any) => {
                            setValue('easting', coords.easting);
                            setValue('northing', coords.northing);
                            setValue('latitude', coords.latitude || null);
                            setValue('longitude', coords.longitude || null);
                            setValue('utmzonenum', coords.zoneNum);
                            setValue('utmzoneletter', coords.zoneLetter);
                        }}
                    />
                </div>

                {/* Coordenadas UTM */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Coordenadas UTM
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase">
                                E (Leste)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('easting')}
                                placeholder="0.00"
                                className="h-12 text-base text-center font-mono bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase">
                                N (Norte)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('northing')}
                                placeholder="0.00"
                                className="h-12 text-base text-center font-mono bg-background/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
