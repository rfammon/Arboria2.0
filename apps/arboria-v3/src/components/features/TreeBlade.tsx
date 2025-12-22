import { useSearchParams } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import TreeDetailContent from './TreeDetailContent';
import { useDensity } from '../../hooks/useDensity';

export default function TreeBlade() {
    const [searchParams, setSearchParams] = useSearchParams();
    const density = useDensity();
    const selectedTreeId = searchParams.get('selectedTree');

    // density check (field = mobile, office = desktop)
    const isMobile = density === 'field';

    const handleClose = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('selectedTree');
        setSearchParams(newParams);
    };

    return (
        <Sheet
            open={!!selectedTreeId}
            onOpenChange={(open) => !open && handleClose()}
            modal={isMobile}
        >
            <SheetContent
                side="right"
                className="w-full sm:max-w-md p-0 overflow-hidden border-l border-border shadow-2xl"
                hideOverlay={!isMobile}
                showClose={false}
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>Tree Details</SheetTitle>
                    <SheetDescription>
                        View and manage details for the selected tree.
                    </SheetDescription>
                </SheetHeader>
                {selectedTreeId && (
                    <TreeDetailContent
                        treeId={selectedTreeId}
                        onClose={handleClose}
                        isBlade={true}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}
