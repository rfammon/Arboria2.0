import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const InstallerController: React.FC = () => {
  // Tauri command to check if the installer has admin privileges
  const checkAdminPrivileges = async (): Promise<boolean> => {
    try {
      const isAdmin: boolean = await invoke('plugin:installer-api|check_admin_privileges');
      return isAdmin;
    } catch (err) {
      console.error('Failed to check admin privileges:', err);
      return false;
    }
  };

  // When component mounts, initialize the installer
  useEffect(() => {
    const initInstaller = async () => {
      // Check if running with admin privileges
      const isAdmin = await checkAdminPrivileges();
      if (!isAdmin) {
        return;
      }

      // Since we can't update state in this simplified version, we'll just log
      console.log('Admin privileges verified, ready for installation');
    };

    initInstaller();
  }, []);

  return (
    <div className="hidden"> {/* This component is for logic only, UI is handled by ArboriaInstaller */}
      {/* This would be connected to the UI component in a real implementation */}
    </div>
  );
};

export default InstallerController;