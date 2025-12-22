declare module 'frappe-gantt' {
    export default class Gantt {
        constructor(
            wrapper: HTMLElement,
            tasks: any[],
            options?: {
                header_height?: number;
                column_width?: number;
                step?: number;
                view_modes?: string[];
                bar_height?: number;
                bar_corner_radius?: number;
                arrow_curve?: number;
                padding?: number;
                view_mode?: string;
                date_format?: string;
                custom_popup_html?: ((task: any) => string) | null;
                on_click?: (task: any) => void;
                on_date_change?: (task: any, start: Date, end: Date) => void;
                on_progress_change?: (task: any, progress: number) => void;
                on_view_change?: (mode: string) => void;
                language?: string;
            }
        );
        change_view_mode(mode: string): void;
        refresh(tasks: any[]): void;
    }
}
