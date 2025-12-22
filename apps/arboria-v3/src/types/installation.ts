export interface Installation {
    id: string;
    nome: string;
    tipo: 'Condomínio' | 'Município' | 'Empresa' | 'Campus' | 'Outro';
    descricao?: string;
    localizacao?: any;
    area_total?: number;
    numero_arvores_estimado?: number;
    contato_responsavel?: any;
    ativo: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    membership?: {
        id: string;
        perfis: string[];
        status: string;
    };
}

export interface Profile {
    id: string;
    nome: string; // 'Mestre' | 'Gestor' | 'Planejador' | 'Executante' | 'Inventariador'
    descricao?: string;
    permissoes: string[];
    nivel: number;
}

export interface Member {
    id: string;
    instalacao_id: string;
    user_id: string;
    perfis: string[]; // UUIDs of profiles
    status: 'ativo' | 'inativo' | 'pendente';
    data_entrada: string;
    data_saida?: string;
    convidado_por?: string;
    nome?: string;
    email?: string;
}

export interface UserProfile extends Member {
    installation: Installation;
    roles: Profile[]; // Expanded profiles
}
