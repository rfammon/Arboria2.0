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
        <div className="space-y-6 pt-6 border-t border-white/10">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 font-display">Localização & Geoprocessamento</label>
            <div className="bg-muted/30 p-4 rounded-2xl border border-white/5 shadow-inner">
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">UTM E (Leste)</label>
                    <Input
                        type="number"
                        step="0.01"
                        {...register('easting')}
                        placeholder="0.00"
                        className="bg-muted/40 border-none shadow-inner h-11 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">UTM N (Norte)</label>
                    <Input
                        type="number"
                        step="0.01"
                        {...register('northing')}
                        placeholder="0.00"
                        className="bg-muted/40 border-none shadow-inner h-11 rounded-xl"
                    />
                </div>
            </div>
        </div>
    );
}
