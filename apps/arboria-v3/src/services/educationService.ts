import { supabase } from '../lib/supabase';

export const educationService = {
  async upsertUserProgress(userId: string, moduleId: string, score: number, status: 'completed' | 'tested_out' | 'in_progress', currentCardIndex: number = 0) {
    try {
      // First get existing progress to compare score
      const { data: existing } = await supabase
        .from('user_education_progress')
        .select('score')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single();

      const finalScore = existing ? Math.max(existing.score, score) : score;

      const { error } = await supabase
        .from('user_education_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          score: finalScore,
          status,
          current_card_index: currentCardIndex,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error upserting progress:', error);
      throw error;
    }
  },
};
