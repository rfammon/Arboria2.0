
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';

export const LocalReportGenerator = {
    async generateFromElement(elementId: string, filename: string) {
        try {
            const element = document.getElementById(elementId);
            if (!element) throw new Error(`Elemento ${elementId} não encontrado.`);

            // 1. Capture content as Image (Canvas)
            console.log(`[LocalReport] Capturing element ${elementId}...`);
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // 2. Initialize PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // 3. Add image to PDF (handling page breaks)
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // 4. Save file
            const pdfOutput = pdf.output('datauristring'); // Returns "data:application/pdf;base64,..."
            const base64Data = pdfOutput.split(',')[1];

            const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';

            console.log(`[LocalReport] Saving to Documents/${sanitizedFilename}...`);
            await Filesystem.writeFile({
                path: sanitizedFilename,
                data: base64Data,
                directory: Directory.Documents
            });

            console.log('[LocalReport] Success');
            return sanitizedFilename;

        } catch (error: any) {
            console.error('[LocalReport] Error:', error);
            toast.error(`Erro na geração local: ${error.message}`);
            throw error;
        }
    }
};
