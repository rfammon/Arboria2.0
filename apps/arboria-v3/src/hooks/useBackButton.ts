import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export const useBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let lastBackButtonTime = 0;
        const exitTimeWindow = 2000; // 2 seconds

        const handleBackButton = async () => {
            // Prevent default behavior to handle it manually
            // Note: @capacitor/app handles preventing default efficiently via the listener itself usually, 
            // but in some versions, you might need to ensure it doesn't conflict. 
            // The event.canGoBack info is useful depending on context, but we rely on React Router here.

            // Check for open modals/sheets (Radix UI uses role="dialog", alertdialog, or data-radix-portal)
            // We search for anything with data-state="open" that is a dialog or a sheet content
            const openModal = document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-radix-collection-item][data-state="open"]');

            if (openModal) {
                // Dispatch Escape key to trigger Radix UI close behavior
                // This is the most reliable way to trigger the onOpenChange(false) or onClose handlers
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                return;
            }

            const currentPath = location.pathname;
            // Define root paths where back button should trigger exit
            const rootPaths = ['/', '/login', '/dashboard', '/onboarding'];

            const isRoot = rootPaths.includes(currentPath);

            if (isRoot) {
                const now = Date.now();
                if (now - lastBackButtonTime < exitTimeWindow) {
                    // Double tap detected, exit app
                    try {
                        await App.exitApp();
                    } catch (e) {
                        console.error('Failed to exit app', e);
                    }
                } else {
                    // First tap, show toast
                    lastBackButtonTime = now;
                    toast.info("Pressione voltar novamente para sair", {
                        duration: 2000,
                        position: 'bottom-center'
                    });
                }
            } else {
                // Not on root, go back in history
                navigate(-1);
            }
        };

        // Add listener
        const listener = App.addListener('backButton', handleBackButton);

        // Cleanup
        return () => {
            listener.then(handler => handler.remove());
        };
    }, [navigate, location]);
};
