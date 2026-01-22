export { };

declare global {
    interface Window {
        __TAURI__?: {
            dialog: {
                open: (options?: { directory?: boolean; multiple?: boolean; defaultPath?: string }) => Promise<string | string[] | null>;
            };
            path: {
                downloadDir: () => Promise<string>;
                join: (...args: string[]) => Promise<string>;
            };
            fs: {
                writeBinaryFile: (path: string, contents: Uint8Array) => Promise<void>;
            };
            shell: {
                open: (path: string) => Promise<void>;
            };
        };
        __TAURI_INTERNALS__?: any;
    }
}
