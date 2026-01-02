import { supabase } from '../lib/supabase';
import type { Installation, Profile } from '../types/installation';

export const InstallationService = {
    async getUserInstallations() {
        // Fetch installations the user is a member of
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Fetch installations the user is a member of
        const { data: members, error: memberError } = await supabase
            .from('instalacao_membros')
            .select(`
                *,
                instalacao:instalacoes!inner(*)
            `)
            .eq('user_id', user.id)
            .eq('status', 'ativo')
            .eq('instalacao.ativo', true);

        if (memberError) throw memberError;

        return members.map((m: any) => ({
            ...m.instalacao,
            membership: {
                id: m.id,
                perfis: m.perfis,
                status: m.status
            }
        }));
    },

    async createInstallation(data: Partial<Installation>) {
        // Validation: Ensure user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: installation, error } = await supabase
            .from('instalacoes')
            .insert(data)
            .select()
            .single();

        if (error) throw error;

        // Automatically add creator as 'Gestor' (Manager)
        // First get 'Gestor' profile ID
        const { data: profiles } = await supabase
            .from('perfis')
            .select('id')
            .eq('nome', 'Gestor')
            .single();

        if (profiles) {
            const { error: memberError } = await supabase
                .from('instalacao_membros')
                .insert({
                    instalacao_id: installation.id,
                    user_id: user.id, // Use validated user.id
                    perfis: [profiles.id],
                    status: 'ativo'
                });

            if (memberError) {
                console.error('Error adding owner as member:', memberError);
                // Optional: Rollback installation creation if member add fails? 
                // For now, we log it. Ideally we should use a Postgres function for atomic creation.
            }
        }

        return installation;
    },

    async getProfiles() {
        const { data, error } = await supabase
            .from('perfis')
            .select('*');

        if (error) throw error;
        return data as Profile[];
    },

    async getInstallationMembers(installationId: string) {
        const { data, error } = await supabase
            .rpc('get_installation_members_with_details', {
                p_instalacao_id: installationId
            });

        if (error) throw error;
        return data || [];
    },

    async removeMember(memberId: string) {
        const { error } = await supabase
            .from('instalacao_membros')
            .delete()
            .eq('id', memberId);

        if (error) throw error;
    },

    async updateMemberProfiles(memberId: string, profileIds: string[]) {
        const { error } = await supabase
            .from('instalacao_membros')
            .update({ perfis: profileIds })
            .eq('id', memberId);

        if (error) throw error;
    },

    async inviteMember(installationId: string, email: string, profileIds: string[]) {
        const { data, error } = await supabase
            .rpc('invite_user_to_installation', {
                p_instalacao_id: installationId,
                p_email: email,
                p_perfis: profileIds
            });

        if (error) throw error;
        return data;
    },

    async deleteInstallation(installationId: string) {
        // Double check confirmation is handled in UI
        const { error } = await supabase
            .rpc('delete_installation', { p_instalacao_id: installationId });

        if (error) throw error;
    },

    async getProjectMembers(installationId: string) {
        const { data, error } = await supabase
            .rpc('get_installation_members_with_details', {
                p_instalacao_id: installationId
            });

        if (error) throw error;

        if (!data || data.length === 0) return [];

        return data.map((m: any) => ({
            user_id: m.user_id,
            nome: m.nome || 'Usuário sem nome',
            email: m.email
        }));
    }
};
