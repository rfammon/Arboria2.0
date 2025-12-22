import { type OfflineAction } from '../store/actionQueue';
import { supabase } from '../lib/supabase';

// Helper to upload blob evidence
const uploadEvidence = async (file: Blob | File): Promise<string> => {
    const fileName = `${crypto.randomUUID()}.jpg`; // Assuming JPEG for now
    const { error } = await supabase.storage
        .from('evidence')
        .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('evidence')
        .getPublicUrl(fileName);

    return publicUrl;
};

export const api = {
    sync: async (action: OfflineAction): Promise<void> => {
        switch (action.type) {
            case 'CREATE_TREE': {
                const { error } = await supabase
                    .from('trees')
                    .insert(action.payload);
                if (error) throw error;
                break;
            }

            case 'UPDATE_TREE': {
                const { id, ...updates } = action.payload;
                const { error } = await supabase
                    .from('trees')
                    .update(updates)
                    .eq('id', id);
                if (error) throw error;
                break;
            }

            case 'DELETE_TREE': {
                const { id } = action.payload;
                const { error } = await supabase
                    .from('trees')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                break;
            }

            case 'UPLOAD_PHOTO': {
                // Payload expected: { taskId: string, photo: Blob/File, notes: string }
                const { taskId, photo, notes } = action.payload;

                let evidenceUrl = null;
                if (photo) {
                    evidenceUrl = await uploadEvidence(photo);
                }

                // Update the task with status COMPLETED and evidence
                const { error } = await supabase
                    .from('tasks')
                    .update({
                        status: 'COMPLETED',
                        completed_at: new Date().toISOString(),
                        evidence_url: evidenceUrl,
                        notes: notes
                    })
                    .eq('id', taskId);

                if (error) throw error;
                break;
            }

            default:
                console.warn('[API] Unknown action type:', action.type);
        }
    }
};
