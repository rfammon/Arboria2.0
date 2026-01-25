import { Routes, Route, HashRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { UpdateProvider } from './context/UpdateContext';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Inventory from './pages/Inventory';
import TreeDetails from './pages/TreeDetails';
import Education from './pages/Education';
import TopicPage from './pages/TopicPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import { TooltipProvider } from './components/ui/tooltip';
import InstallationSettings from './pages/InstallationSettings';
import Settings from './pages/Settings';
import InstallationSelector from './pages/InstallationSelector';
import ActivityHistory from './pages/ActivityHistory';
import PlanManager from './pages/PlanManager';
import Reports from './pages/Reports';
import Execution from './pages/Execution';
import AlertsCenter from './pages/AlertsCenter';
import ExecutionDashboard from './pages/ExecutionDashboard';
import { ExecutionPageGuard } from './components/execution/ExecutionPageGuard';
import { Toaster } from './components/ui/sonner';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfUse from './pages/legal/TermsOfUse';
import DownloadsPage from './pages/Downloads';
import ExecutionReportView from './pages/ExecutionReportView';

import { FilterProvider } from './context/FilterContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useBackButton } from './hooks/useBackButton';
import { useDensity } from './hooks/useDensity';

import { useDeepLinking } from './hooks/useDeepLinking';

import { useKeepAlive } from './hooks/useKeepAlive';

// Import new features
import { ErrorDialog } from './components/common/ErrorDialog';
import { useErrorDialog } from './hooks/useErrorDialog';
import { startHeartbeat, stopHeartbeat } from './lib/connectivity/heartbeat';

function AppContent() {
  useKeepAlive();
  usePushNotifications();
  useDeepLinking();
  useBackButton();
  useDensity();
  
  // Initialize heartbeat for connectivity monitoring
  useEffect(() => {
    startHeartbeat(30000); // Check every 30s
    return () => stopHeartbeat();
  }, []);

  // Error Dialog state
  const { isOpen, error, title, closeError } = useErrorDialog();

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/:treeId" element={<TreeDetails />} />
          <Route path="education" element={<Education />} />
          <Route path="education/:topicId" element={<TopicPage />} />
          <Route path="plan-manager" element={<PlanManager />} />
          <Route path="plans" element={<PlanManager />} />
          <Route path="activity-history" element={<ActivityHistory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="alerts" element={<AlertsCenter />} />
          <Route path="settings" element={<Settings />} />
          <Route path="execution" element={
            <ExecutionPageGuard>
              <Execution />
            </ExecutionPageGuard>
          } />
          <Route path="execution/dashboard" element={
            <ExecutionPageGuard>
              <ExecutionDashboard />
            </ExecutionPageGuard>
          } />
          <Route path="downloads" element={<DownloadsPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/installation-settings" element={<InstallationSettings />} />
        <Route path="/installation-selector" element={<InstallationSelector />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/execution/report/:taskId" element={<ExecutionReportView />} />
      </Routes>
      <Toaster />
      
      {/* Global Error Dialog */}
      <ErrorDialog
        isOpen={isOpen}
        onClose={closeError}
        error={error || { message: '' }}
        title={title}
      />
    </>
  );
}

import { DefinitionProvider } from './context/DefinitionContext';
import { DefinitionModal } from './components/education/DefinitionModal';
import { DownloadProvider } from './context/DownloadContext';
import { ReportProvider } from './context/ReportContext';
import { GlobalBackgroundCapture } from './components/layout/GlobalBackgroundCapture';

function App() {
  return (
    <HashRouter>
      <UpdateProvider>
        <DownloadProvider>
          <ReportProvider>
            <OfflineSyncProvider>
              <TooltipProvider>
                <DefinitionProvider>
                  <FilterProvider>
                    <AppContent />
                    <DefinitionModal />
                    <GlobalBackgroundCapture />
                  </FilterProvider>
                </DefinitionProvider>
              </TooltipProvider>
            </OfflineSyncProvider>
          </ReportProvider>
        </DownloadProvider>
      </UpdateProvider>
    </HashRouter>
  );
}

export default App;
