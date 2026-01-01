import { Routes, Route, HashRouter } from 'react-router-dom';
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

import { FilterProvider } from './context/FilterContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useBackButton } from './hooks/useBackButton';
import { useDensity } from './hooks/useDensity';

import { useDeepLinking } from './hooks/useDeepLinking';

function AppContent() {
  usePushNotifications();
  useDeepLinking();
  useBackButton();
  useDensity();

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
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/installation-settings" element={<InstallationSettings />} />
        <Route path="/installation-selector" element={<InstallationSelector />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
      </Routes>
      <Toaster />
    </>
  );
}

import { DefinitionProvider } from './context/DefinitionContext';
import { DefinitionModal } from './components/education/DefinitionModal';

function App() {
  return (
    <HashRouter>
      <UpdateProvider>
        <OfflineSyncProvider>
          <TooltipProvider>
            <DefinitionProvider>
              <FilterProvider>
                <AppContent />
                <DefinitionModal />
              </FilterProvider>
            </DefinitionProvider>
          </TooltipProvider>
        </OfflineSyncProvider>
      </UpdateProvider>
    </HashRouter>
  );
}

export default App;
