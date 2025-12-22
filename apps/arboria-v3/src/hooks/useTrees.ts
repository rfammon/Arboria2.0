import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Tree } from '../types/tree';
import { useAuth } from '../context/AuthContext';
import { utmToLatLon, hasValidCoordinates } from '../lib/coordinateUtils';
import { diagnoseCoordinates, validateLatLon } from '../lib/coordinateValidator';

export const useTrees = () => {
    const { user, activeInstallation } = useAuth();

    return useQuery({
        // Include installation ID in query key to trigger refetch on change
        queryKey: ['trees', activeInstallation?.id],
        queryFn: async () => {
            if (!activeInstallation?.id) return [];

            console.log(`[useTrees] Fetching trees for installation: ${activeInstallation.nome} (${activeInstallation.id})`);

            // Filter by active installation
            const { data, error } = await supabase
                .from('arvores')
                .select('*')
                .eq('instalacao_id', activeInstallation.id)
                .limit(100);

            if (error) throw error;

            if (!data) return [];

            console.log('[useTrees] Fetched trees from database:', data.length);

            // Convert UTM coordinates to Lat/Lon for map display
            const treesWithLatLon = (data as Tree[]).map(tree => {
                // Diagnose coordinate status
                diagnoseCoordinates(tree);

                // If tree already has valid lat/lon, use it
                if (tree.latitude && tree.longitude) {
                    const validation = validateLatLon(tree.latitude, tree.longitude);

                    if (validation.isValid) {
                        return tree;
                    }
                }

                // If tree has UTM coordinates, convert them
                if (hasValidCoordinates(tree.easting, tree.northing)) {
                    const latLon = utmToLatLon(
                        tree.easting!,
                        tree.northing!,
                        tree.utmzonenum || undefined,
                        tree.utmzoneletter || undefined
                    );

                    if (latLon) {
                        const validation = validateLatLon(latLon.latitude, latLon.longitude);

                        if (validation.isValid) {
                            return {
                                ...tree,
                                latitude: latLon.latitude,
                                longitude: latLon.longitude,
                            };
                        }
                    }
                }

                return tree;
            });

            return treesWithLatLon as Tree[];
        },
        enabled: !!user && !!activeInstallation,
    });
};
