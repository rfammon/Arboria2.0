import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

// Register Service Worker for PWA
registerSW({ immediate: true })
import App from './App.tsx'
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Initialize PWA Elements for Capacitor Camera
try {
  defineCustomElements(window);
} catch (e) {
  console.error('Error initializing PWA elements', e);
}
const rootElement = document.getElementById('root');
if (!rootElement) console.error('Root element not found!');

createRoot(rootElement!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
