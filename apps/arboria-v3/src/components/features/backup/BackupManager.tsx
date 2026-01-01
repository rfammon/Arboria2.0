import { useState } from 'react';
import { BackupService } from '@/services/backupService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

export function BackupManager() {
    const { activeInstallation } = useAuth();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await BackupService.exportData(activeInstallation?.id);
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                if (!confirm('Importar backup irá substituir dados existentes que possuam o mesmo ID. Deseja continuar?')) {
                    return;
                }

                setIsImporting(true);
                try {
                    await BackupService.importData(file);
                } finally {
                    setIsImporting(false);
                }
            }
        };
        input.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Backup e Portabilidade</CardTitle>
                <CardDescription>
                    Exporte seus dados para segurança ou importe para outro dispositivo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <Download className="h-4 w-4" />
                    <AlertTitle>Backup Completo</AlertTitle>
                    <AlertDescription>
                        O backup inclui todas as árvores cadastradas e fotos (offline e online).
                    </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || isImporting}
                        className="flex-1"
                    >
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Exportar Dados
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleImportClick}
                        disabled={isExporting || isImporting}
                        className="flex-1"
                    >
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Importar Backup
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                    Formato: .zip (JSON + Imagens)
                </p>
            </CardContent>
        </Card>
    );
}
