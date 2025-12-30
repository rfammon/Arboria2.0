import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';

export function useDeepLinking() {
    const navigate = useNavigate();

    useEffect(() => {
        let listener: any;

        const setupListener = async () => {
            listener = await App.addListener('appUrlOpen', (event) => {
                const urlStr = event.url;
                // Handle scheme: arboria:// or https://arboria.app
                const url = new URL(urlStr);

                // Check if it's our scheme
                if (url.protocol.includes('arboria')) {
                    // pathname usually comes as /path/to/resource
                    // For arboria://execution/task/123
                    // hostname might be execution or it might be treated as part of path depending on slashes

                    let path = url.pathname;

                    // Fix for arboria://path vs arboria://host/path
                    // If url is arboria://execution/task/123 -> host=execution, pathname=/task/123
                    // We want /execution/task/123

                    if (url.host && url.host !== 'arboria.app') {
                        path = '/' + url.host + path;
                    }

                    // Clean double slashes
                    path = path.replace('//', '/');

                    // Add search params + hash
                    if (url.search) path += url.search;
                    if (url.hash) path += url.hash;

                    console.log(`Deep link navigating to: ${path}`);
                    navigate(path);
                }
            });
        };

        setupListener();

        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [navigate]);
}
