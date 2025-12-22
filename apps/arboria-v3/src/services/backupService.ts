import JSZip from 'jszip';
import { supabase } from '@/lib/supabase';
import { getAllPhotos, savePhotoLocally } from '@/lib/photoStorage';
import { toast } from 'sonner';

export interface BackupManifest {
    version: string;
    timestamp: string;
    counts: {
        trees: number;
        photos: number;
    };
}

export const BackupService = {
    /**
     * Export all data to a ZIP file
     */
    exportData: async (): Promise<void> => {
        try {
            const zip = new JSZip();

            // 1. Fetch Trees from Supabase
            // TODO: Also fetch from offline queue if needed? For now assuming specific "Backup" button uses current state
            const { data: trees, error } = await supabase.from('trees').select('*');

            if (error) throw error;
            if (!trees) throw new Error('No trees found');

            // 2. Fetch Photos from IndexedDB
            const photos = await getAllPhotos();

            // 3. Create Manifest
            const manifest: BackupManifest = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                counts: {
                    trees: trees.length,
                    photos: photos.length
                }
            };

            // 4. Add data to Zip
            zip.file('manifest.json', JSON.stringify(manifest, null, 2));
            zip.file('data/trees.json', JSON.stringify(trees, null, 2));

            // Extract metadata (exclude blob) for restoration
            const photosMetadata = photos.map(({ blob, ...meta }) => meta);
            zip.file('data/photos.json', JSON.stringify(photosMetadata, null, 2));

            // 5. Add photos to Zip
            const photosFolder = zip.folder('photos');
            if (photosFolder) {
                photos.forEach(photo => {
                    // Use filename from metadata or ID
                    const filename = `${photo.id}.jpg`;
                    photosFolder.file(filename, photo.blob);
                });
            }

            // 6. Generate and Download
            const content = await zip.generateAsync({ type: 'blob' });

            // Trigger download
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `arboria_backup_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Backup exportado com sucesso!');

        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Erro ao exportar backup');
            throw error;
        }
    },

    /**
     * Import data from a ZIP file
     */
    importData: async (file: File): Promise<void> => {
        try {
            console.log("Loading zip...");
            const zip = await JSZip.loadAsync(file);

            // 1. Read Manifest & Data
            const treesStr = await zip.file('data/trees.json')?.async('string');
            const photosMetaStr = await zip.file('data/photos.json')?.async('string');

            if (!treesStr) throw new Error('Inválido: faltando trees.json');

            const trees = JSON.parse(treesStr);
            console.log(`Restoring ${trees.length} trees...`);
            const photosMetadata = photosMetaStr ? JSON.parse(photosMetaStr) : [];

            // 2. Restore Trees (Upsert)
            const { error: treeError } = await supabase
                .from('trees')
                .upsert(trees, { onConflict: 'id' });

            if (treeError) throw treeError;

            // 3. Restore Photos
            const photosFolder = zip.folder('photos');
            if (photosFolder && photosMetadata.length > 0) {
                let restoredCount = 0;
                console.log(`Restoring ${photosMetadata.length} photos...`);

                for (const meta of photosMetadata) {
                    const filename = `${meta.id}.jpg`;
                    const photoFile = zip.file(`photos/${filename}`);

                    if (photoFile) {
                        const blob = await photoFile.async('blob');
                        const file = new File([blob], meta.metadata.filename, { type: blob.type });

                        const photoToRestore = {
                            id: meta.id,
                            file: file,
                            treeId: meta.treeId,
                            metadata: meta.metadata,
                            syncStatus: meta.syncStatus as any,
                            uploadedAt: meta.uploadedAt ? new Date(meta.uploadedAt) : undefined,
                            uploadError: meta.uploadError
                        };

                        await savePhotoLocally(photoToRestore);
                        restoredCount++;
                    }
                }
                console.log(`Restored ${restoredCount} photos`);
            }

            toast.success('Backup importado com sucesso!');

        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Erro ao importar backup');
            throw error;
        }
    }
};
