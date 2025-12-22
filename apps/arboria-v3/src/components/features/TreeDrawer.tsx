import { Drawer } from 'vaul';
import { useSearchParams } from 'react-router-dom';
import TreeDetailContent from './TreeDetailContent';

export function TreeDrawer() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedTreeId = searchParams.get('selectedTree');

    const handleClose = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('selectedTree');
        setSearchParams(newParams);
    };

    return (
        <Drawer.Root
            open={!!selectedTreeId}
            onOpenChange={(open) => !open && handleClose()}
            shouldScaleBackground
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
                <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none overflow-hidden">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4 z-[102]" />
                    <Drawer.Title className="sr-only">Tree Details</Drawer.Title>
                    <Drawer.Description className="sr-only">
                        View and manage details for the selected tree.
                    </Drawer.Description>

                    <div className="flex-1 overflow-y-auto">
                        {selectedTreeId && (
                            <TreeDetailContent
                                treeId={selectedTreeId}
                                onClose={handleClose}
                                isBlade={false}
                            />
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
