import { useEducationStore } from '../../../stores/useEducationStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Award, CheckCircle, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function SkillWallet() {
    const { modules, certificationStatus } = useEducationStore();
    const isCertified = certificationStatus === 'certified';

    const handleDownloadCertificate = () => {
        // Trigger browser print, optimized by CSS media query in global styles (or inline styles)
        window.print();
        toast.success('Preparando certificado para impressão...');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Carteira Profissional</h2>
                {isCertified && (
                    <Button onClick={handleDownloadCertificate} className="print:hidden">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Certificado
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Certification Card */}
                <Card className={`border-l-4 ${isCertified ? 'border-green-500' : 'border-gray-300'} bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md`}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <ShieldCheck className={`w-8 h-8 ${isCertified ? 'text-green-600' : 'text-gray-400'}`} />
                            <Badge variant={isCertified ? 'default' : 'secondary'}>
                                {isCertified ? 'VERIFICADO' : 'PENDENTE'}
                            </Badge>
                        </div>
                        <CardTitle className="mt-4">Certificação de Segurança de Campo</CardTitle>
                        <CardDescription>Habilitação Fundamental Arboria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-500 space-y-1">
                            <p>Status: <span className="font-medium text-gray-900 dark:text-gray-100">{isCertified ? 'Ativo' : 'Em Progresso'}</span></p>
                            {isCertified && <p>Emitido em: {new Date().toLocaleDateString()}</p>}
                            <p>ID: {isCertified ? 'ARB-CERT-2024-8821' : '---'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Specializations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            Especializações
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {['pruning', 'risk', 'ops'].map(id => {
                                const mod = modules[id];
                                const isUnlocked = mod?.status === 'available' || mod?.status === 'completed';
                                const isDone = mod?.status === 'completed';

                                if (!isUnlocked) return null;

                                return (
                                    <div key={id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-purple-500' : 'bg-yellow-500'}`} />
                                            <div>
                                                <p className="font-medium capitalize">{id === 'ops' ? 'Operações' : id}</p>
                                                <p className="text-xs text-gray-500">{isDone ? 'Habilitado' : 'Em Treinamento'}</p>
                                            </div>
                                        </div>
                                        {isDone && <CheckCircle className="w-4 h-4 text-green-500" />}
                                    </div>
                                );
                            })}
                            {!isCertified && (
                                <p className="text-sm text-gray-400 italic text-center py-4">
                                    Conclua a certificação para desbloquear especializações.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hidden Print Certificate Template */}
            <div id="print-certificate" className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 text-center text-black">
                <div className="border-8 border-double border-gray-800 h-full flex flex-col items-center justify-center p-12">
                    <h1 className="text-6xl font-serif mb-8 text-gray-900">Certificado de Proficiência</h1>
                    <p className="text-xl mb-12 text-gray-600">Este documento certifica que</p>
                    <h2 className="text-4xl font-bold mb-8 underline decoration-double">Usuario Profissional</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Concluiu com êxito os requisitos teóricos e práticos da <strong>Certificação de Segurança de Campo Arboria</strong>.
                    </p>
                    <div className="mt-16 flex justify-between w-full max-w-3xl px-12 border-t border-gray-300 pt-8">
                        <div className="text-left">
                            <p className="font-bold">Data de Emissão</p>
                            <p>{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">ID da Credencial</p>
                            <p>ARB-CERT-2024-8821</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-certificate, #print-certificate * {
                        visibility: visible;
                    }
                    #print-certificate {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                    }
                }
            `}</style>
        </div>
    );
}
