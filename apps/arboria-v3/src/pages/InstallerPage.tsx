import React from 'react';
import ArboriaInstaller from '../components/core/installer/ArboriaInstaller';
import InstallerController from '../components/core/installer/InstallerController';

const InstallerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <InstallerController />
        <ArboriaInstaller />
      </div>
    </div>
  );
};

export default InstallerPage;