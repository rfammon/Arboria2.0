import { useQuery } from '@tanstack/react-query';
import { InstallationService } from '../lib/installationService';

export const useInstallationKeys = {
    all: ['installation'] as const,
    members: (id: string) => [...useInstallationKeys.all, 'members', id] as const,
};

export const useInstallationMembers = (installationId: string | undefined) => {
    return useQuery({
        queryKey: useInstallationKeys.members(installationId ?? ''),
        queryFn: () => InstallationService.getProjectMembers(installationId!),
        enabled: !!installationId,
    });
};
