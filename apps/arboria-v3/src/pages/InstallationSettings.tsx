import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InstallationService } from '../lib/installationService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Users, Building, Plus, Trash2, Pencil, Check, AlertTriangle } from 'lucide-react';
import type { Profile, Member } from '../types/installation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";

interface InstallationSettingsProps {
    embedded?: boolean;
}

export default function InstallationSettings({ embedded = false }: InstallationSettingsProps) {
    const { activeInstallation, refreshInstallations, setActiveInstallation } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');

    // Editing State
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

    // Permission State
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        if (activeInstallation && members.length > 0) {
            checkPermissions();
        }
    }, [activeInstallation, members]);

    const checkPermissions = async () => {
        try {
            // Get current user's membership in this installation
            const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
            if (!user) return;

            const membership = members.find(m => m.user_id === user.id);
            if (membership) {
                // Check if user has Gestor or Mestre profile
                // We need profile names, so we need to match profile IDs to names
                const memberProfileNames = membership.perfis.map(pid =>
                    profiles.find(p => p.id === pid)?.nome
                ).filter(Boolean);

                const hasPermission = memberProfileNames.some(name =>
                    name === 'Gestor' || name === 'Mestre'
                );
                setCanEdit(hasPermission);
            }
        } catch (e) {
            console.error('Error checking permissions:', e);
        }
    };

    const [isCreating, setIsCreating] = useState(false);
    const [newInstallationName, setNewInstallationName] = useState('');
    const [newInstallationType, setNewInstallationType] = useState<'Condomínio' | 'Parque'>('Condomínio');

    useEffect(() => {
        if (activeInstallation) {
            loadData();
        } else {
            setIsCreating(true);
        }
    }, [activeInstallation]);

    const loadData = async () => {
        if (!activeInstallation) return;
        try {
            const [membersData, profilesData] = await Promise.all([
                InstallationService.getInstallationMembers(activeInstallation.id),
                InstallationService.getProfiles()
            ]);
            setMembers(membersData || []);
            setProfiles(profilesData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erro ao carregar dados da instalação');
        }
    };

    const handleCreateInstallation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newInstallation = await InstallationService.createInstallation({
                nome: newInstallationName,
                tipo: newInstallationType as any
            });
            toast.success('Instalação criada com sucesso!');
            await refreshInstallations();

            // Auto-select and redirect
            setActiveInstallation(newInstallation);
            navigate('/');
        } catch (error: any) {
            console.error('Error creating installation:', error);
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
                toast.error('Este nome de instalação já existe. Por favor, escolha outro.');
            } else {
                toast.error(`Erro ao criar instalação: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInstallation = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.info('Funcionalidade em desenvolvimento');
    };

    const handleDeleteInstallation = async () => {
        if (!activeInstallation) return;

        const confirmName = prompt('Esta ação irá DESATIVAR a instalação. Os dados não serão apagados, mas a instalação ficará invisível para todos os membros.\n\nPara confirmar, digite o nome da instalação: ' + activeInstallation.nome);

        if (confirmName !== activeInstallation.nome) {
            toast.error('Nome incorreto. Ação cancelada.');
            return;
        }

        try {
            await InstallationService.deleteInstallation(activeInstallation.id);
            toast.success('Instalação desativada com sucesso.');
            window.location.href = '/';
        } catch (error: any) {
            console.error('Error deactivating installation:', error);
            toast.error(error.message || 'Erro ao desativar instalação.');
        }
    };

    const [inviteProfile, setInviteProfile] = useState<string>('');

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !inviteProfile) {
            toast.error('Por favor, informe o email e selecione um perfil.');
            return;
        }

        try {
            const result = await InstallationService.inviteMember(
                activeInstallation!.id,
                inviteEmail,
                [inviteProfile]
            );

            if (result.status === 'added') {
                toast.success('Usuário encontrado e adicionado com sucesso!');
                loadData(); // Refresh list
            } else {
                toast.success(`Convite enviado para ${inviteEmail}`);
            }

            setInviteEmail('');
            setInviteProfile('');
        } catch (error: any) {
            console.error('Error inviting member:', error);
            toast.error(error.message || 'Erro ao convidar membro');
        }
    };



    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Tem certeza que deseja remover este membro da instalação?')) return;
        try {
            await InstallationService.removeMember(memberId);
            toast.success('Membro removido com sucesso');
            loadData();
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Erro ao remover membro');
        }
    };

    const openEditMember = (member: Member) => {
        setEditingMember(member);
        setSelectedProfiles(member.perfis || []);
    };

    const handleSaveProfiles = async () => {
        if (!editingMember) return;
        try {
            await InstallationService.updateMemberProfiles(editingMember.id, selectedProfiles);
            toast.success('Perfis atualizados com sucesso');
            setEditingMember(null);
            loadData();
        } catch (error) {
            console.error('Error updating profiles:', error);
            toast.error('Erro ao atualizar perfis');
        }
    };

    const toggleProfile = (profileId: string) => {
        setSelectedProfiles(prev =>
            prev.includes(profileId)
                ? prev.filter(id => id !== profileId)
                : [...prev, profileId]
        );
    };

    const getProfileName = (profileIds: string[]) => {
        if (!profileIds || profileIds.length === 0) return 'Sem perfil';
        return profileIds.map(id => profiles.find(p => p.id === id)?.nome).join(', ');
    };

    if (isCreating || !activeInstallation) {
        return (
            <div className="max-w-md mx-auto mt-10 space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Criar Nova Instalação</h2>
                    <p className="text-muted-foreground">Configure sua nova área de trabalho.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes da Instalação</CardTitle>
                        <CardDescription>Defina o nome e tipo da sua nova instalação.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateInstallation} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newName">Nome da Instalação</Label>
                                <Input
                                    id="newName"
                                    placeholder="Ex: Condomínio Bosque, Minha Fazenda..."
                                    value={newInstallationName}
                                    onChange={(e) => setNewInstallationName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newType">Tipo</Label>
                                <select
                                    id="newType"
                                    value={newInstallationType}
                                    onChange={(e) => setNewInstallationType(e.target.value as any)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="Condomínio">Condomínio</option>
                                    <option value="Município">Município</option>
                                    <option value="Parque">Parque</option>
                                    <option value="Planta Industrial">Planta Industrial</option>
                                    <option value="Campus Corporativo">Campus Corporativo</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Criando...' : 'Criar Instalação'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {!embedded && (
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Configurações da Instalação</h2>
                    <p className="text-muted-foreground">Gerencie detalhes e membros de {activeInstallation.nome}</p>
                </div>
            )}

            <div className="grid gap-6">
                {/* Details Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-gray-500" />
                            <CardTitle>Detalhes</CardTitle>
                        </div>
                        <CardDescription>Informações básicas da instalação.</CardDescription>
                    </CardHeader>
                    <CardContent>




                        <form onSubmit={handleUpdateInstallation} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input id="nome" defaultValue={activeInstallation.nome} disabled={!canEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Input id="tipo" defaultValue={activeInstallation.tipo} disabled={!canEdit} />
                                </div>
                            </div>
                            <Button type="submit" variant="outline" disabled={!canEdit}>Salvar Alterações</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Members Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-gray-500" />
                                <CardTitle>Membros</CardTitle>
                            </div>
                        </div>
                        <CardDescription>Gerencie quem tem acesso a esta instalação.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">



                        {/* Invite Form */}
                        <form onSubmit={handleInviteMember} className="flex gap-2 items-end mb-6 pb-6 border-b">
                            <div className="w-[30%]">
                                <Label htmlFor="email" className="mb-2 block">Email do novo membro</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-[30%]">
                                <Label htmlFor="inviteProfile" className="mb-2 block">Perfil</Label>
                                <select
                                    id="inviteProfile"
                                    value={inviteProfile}
                                    onChange={(e) => setInviteProfile(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="" disabled>Selecione...</option>
                                    {profiles.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit">
                                <Plus className="h-4 w-4 mr-2" />
                                Convidar
                            </Button>
                        </form>

                        {/* Members List */}
                        <div className="border rounded-lg divide-y">
                            {members.map((member) => (
                                <div key={member.id} className="p-4 flex items-center justify-between transition-colors hover:bg-muted/50">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium truncate max-w-[200px]" title={member.user_id}>
                                                {member.nome || `ID: ${member.id.substring(0, 8)}...`}
                                            </p>
                                            {/* Badge or indicator if "Mestre" etc? */}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {getProfileName(member.perfis)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditMember(member)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {members.length === 0 && (
                                <div className="p-8 text-center text-gray-500">Nenhum membro encontrado.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                {canEdit && (
                    <Card className="border-red-200">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
                            </div>
                            <CardDescription>Ações destrutivas e irreversíveis.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                <div>
                                    <p className="font-medium text-red-900">Desativar Instalação</p>
                                    <p className="text-sm text-red-700 mt-1">
                                        Oculta a instalação para todos os usuários. Os dados (Inventário, Planos, Histórico) são preservados no banco de dados.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteInstallation}
                                >
                                    Desativar Instalação
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>

            {/* Edit Profiles Dialog */}
            <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gerenciar Perfis</DialogTitle>
                        <DialogDescription>
                            Selecione os perfis de acesso para este membro.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {profiles.map((profile) => (
                            <div key={profile.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={profile.id}
                                    checked={selectedProfiles.includes(profile.id)}
                                    onCheckedChange={() => toggleProfile(profile.id)}
                                />
                                <Label htmlFor={profile.id} className="cursor-pointer">{profile.nome}</Label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingMember(null)}>Cancelar</Button>
                        <Button onClick={handleSaveProfiles}>
                            <Check className="w-4 h-4 mr-2" />
                            Salvar Perfis
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
