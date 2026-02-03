import { Bug } from 'lucide-react';
import { Button, type ButtonProps } from '../ui/button';
import { BugReportDialog } from '../core/BugReportDialog';
import { cn } from '../../lib/utils';

interface BugReportButtonProps extends ButtonProps {
    showLabel?: boolean;
    label?: string;
}

export function BugReportButton({ 
    className, 
    variant = 'ghost', 
    size = 'sm', 
    showLabel = true, 
    label = 'Reportar Bug',
    ...props 
}: BugReportButtonProps) {
    return (
        <BugReportDialog>
            <Button 
                variant={variant} 
                size={size} 
                className={cn("gap-2", className)} 
                {...props}
            >
                <Bug className="h-4 w-4" />
                {showLabel && <span>{label}</span>}
            </Button>
        </BugReportDialog>
    );
}
