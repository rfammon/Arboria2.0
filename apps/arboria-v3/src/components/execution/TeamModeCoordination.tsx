import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Plus, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
    id: string;
    nome: string;
    avatar_url?: string;
    role?: string;
}

interface ChatMessage {
    id: string;
    user_id: string;
    user_name: string;
    message: string;
    created_at: string;
}

interface TeamModeCoordinationProps {
    taskId: string;
    initialMembers?: string[]; // IDs
    onMembersUpdate?: (members: string[]) => void;
}

export function TeamModeCoordination({ taskId, initialMembers = [], onMembersUpdate }: TeamModeCoordinationProps) {
    const { user, activeInstallation } = useAuth();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Fetch member details
    useEffect(() => {
        if (initialMembers.length > 0) {
            fetchMembers(initialMembers);
        }
    }, [initialMembers]);

    // Available users for selection
    useEffect(() => {
        if (isManageOpen && activeInstallation) {
            fetchAvailableUsers();
        }
    }, [isManageOpen, activeInstallation]);

    // Realtime chat subscription
    useEffect(() => {
        if (!isChatOpen || !taskId) return;

        const channel = supabase
            .channel(`task_chat:${taskId}`)
            .on('broadcast', { event: 'message' }, (payload) => {
                setMessages(prev => [...prev, payload.payload as ChatMessage]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isChatOpen, taskId]);

    const fetchMembers = async (ids: string[]) => {
        const { data } = await supabase
            .from('perfis')
            .select('id, nome, avatar_url')
            .in('id', ids);

        if (data) setMembers(data);
    };

    const fetchAvailableUsers = async () => {
        // Fetch users from installation that are not in members
        // Should use instalacao_membros join in real app
        // Mocking for now by fetching profiles
        const { data } = await supabase
            .from('perfis')
            .select('id, nome, avatar_url');

        if (data) {
            setAvailableUsers(data.filter(u => !initialMembers.includes(u.id)));
        }
    };

    const addMember = async (memberId: string) => {
        try {
            const newMembers = [...initialMembers, memberId];

            // Update Task
            const { error } = await supabase
                .from('tasks')
                .update({ team_members: newMembers })
                .eq('id', taskId);

            if (error) throw error;

            onMembersUpdate?.(newMembers);
            fetchMembers(newMembers);
            fetchAvailableUsers();
            toast.success('Membro adicionado!');
        } catch (error) {
            toast.error('Erro ao adicionar membro');
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !user) return;

        const msg: ChatMessage = {
            id: crypto.randomUUID(),
            user_id: user.id,
            user_name: user?.email?.split('@')[0] || 'Usuário', // Simple fallback name
            message: newMessage,
            created_at: new Date().toISOString()
        };

        // Send to channel
        await supabase.channel(`task_chat:${taskId}`).send({
            type: 'broadcast',
            event: 'message',
            payload: msg
        });

        setMessages(prev => [...prev, msg]);
        setNewMessage('');
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
                {members.slice(0, 3).map(member => (
                    <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={member.avatar_url || ''} />
                        <AvatarFallback>{member.nome?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                ))}
                {members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                        +{members.length - 3}
                    </div>
                )}
            </div>

            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Equipe da Tarefa</DialogTitle>
                        <DialogDescription>Gerencie os membros da equipe para esta tarefa.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="font-medium">Membros Atuais</div>
                        {members.map(member => (
                            <div key={member.id} className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{member.nome?.substring(0, 2) || 'U'}</AvatarFallback>
                                </Avatar>
                                <span>{member.nome}</span>
                            </div>
                        ))}

                        <div className="border-t pt-4">
                            <div className="font-medium mb-2">Adicionar Membro</div>
                            <ScrollArea className="h-[200px]">
                                {availableUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{user.nome?.substring(0, 2) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span>{user.nome}</span>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => addMember(user.id)}>Add</Button>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 relative">
                        <MessageSquare className="h-4 w-4" />
                        {isChatOpen && <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chat da Equipe</DialogTitle>
                        <DialogDescription>Comunique-se em tempo real com a equipe.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col h-[400px]">
                        <ScrollArea className="flex-1 p-4 border rounded-md mb-4 bg-muted/50">
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        Sem mensagens. Inicie a conversa!
                                    </div>
                                )}
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.user_id === user?.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background border'
                                            }`}>
                                            <p className="font-bold text-xs opacity-70 mb-1">{msg.user_name}</p>
                                            {msg.message}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Digite sua mensagem..."
                            />
                            <Button size="icon" onClick={sendMessage}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
