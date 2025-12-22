import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import './frappe-gantt-base.css';

export interface FrappeTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string;
    custom_class?: string;
}

interface FrappeGanttProps {
    tasks: FrappeTask[];
    viewMode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
    onDateChange?: (task: FrappeTask, start: Date, end: Date) => void;
    onProgressChange?: (task: FrappeTask, progress: number) => void;
    onClick?: (task: FrappeTask) => void;
}

export function FrappeGantt({
    tasks,
    viewMode = 'Week',
    onDateChange,
    onProgressChange,
    onClick
}: FrappeGanttProps) {
    const ganttRef = useRef<HTMLDivElement>(null);
    const ganttInstance = useRef<any>(null);

    useEffect(() => {
        if (ganttRef.current && tasks.length > 0) {
            // Clear previous instance content if any (though frappe-gantt usually appends)
            ganttRef.current.innerHTML = '';

            ganttInstance.current = new Gantt(ganttRef.current, tasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: viewMode,
                date_format: 'YYYY-MM-DD',
                custom_popup_html: null, // Disable default popup if needed, or customize
                on_date_change: (task: FrappeTask, start: Date, end: Date) => {
                    onDateChange?.(task, start, end);
                },
                on_progress_change: (task: FrappeTask, progress: number) => {
                    onProgressChange?.(task, progress);
                },
                on_click: (task: FrappeTask) => {
                    onClick?.(task);
                },
            });
        }
    }, [tasks, viewMode]); // Re-render when tasks or viewMode changes

    return <div ref={ganttRef} className="frappe-gantt-wrapper w-full overflow-x-auto" />;
}
