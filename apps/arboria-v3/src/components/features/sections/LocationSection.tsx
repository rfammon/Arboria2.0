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
        <div className="space-y-4 pt-4 border-t">
            <label className="text-sm font-medium">Localização</label>
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

            {/* Coordenadas UTM */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">UTM E (Leste)</label>
                    <Input
                        type="number"
                        step="0.01"
                        {...register('easting')}
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">UTM N (Norte)</label>
                    <Input
                        type="number"
                        step="0.01"
                        {...register('northing')}
                        placeholder="0.00"
                    />
                </div>
            </div>
        </div>
    );
}
