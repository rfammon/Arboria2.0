import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
    const { hasPermission, permissions, activeProfileNames } = useAuth();

    return {
        hasPermission,
        permissions,
        activeProfileNames,
        isGuest: permissions.length === 0,
        isMaster: permissions.includes('global_access')
    };
};
