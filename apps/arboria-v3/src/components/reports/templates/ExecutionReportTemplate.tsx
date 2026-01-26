import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TreeData {
    codigo: string;
    especie: string;
    localizacao: string;
    nivelRisco: string;
    altura: number;
    dap: number;
    latitude?: number;
    longitude?: number;
}

interface ExecutionData {
    id: string;
    dataEmissao: Date;
    diagnostico: string;
    acao: string;
    observacoes: string;
    equipe: string;
    fotos: {
        antes: string[];
        execucao: string[];
        depois: string[];
    };
}

interface ExecutionReportTemplateProps {
    tree: TreeData;
    execution: ExecutionData;
    mapImage?: string;
}

export function ExecutionReportTemplate({ tree, execution, mapImage }: ExecutionReportTemplateProps) {
    return (
        <div style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '10mm',
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: 'white',
            color: '#0f172a'
        }}>
            {/* Tailwind via CDN for Puppeteer rendering */}
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
            
            <style>{`
                body { margin: 0; padding: 0; }
                .break-inside-avoid { page-break-inside: avoid; }
                @page { size: A4; margin: 0; }
                .bento-card { border-radius: 2rem; border: 1px solid #f1f5f9; background-color: #f8fafc; padding: 1.25rem; }
            `}</style>

            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-[#002b36] rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-[#00e676] rounded-full"></div>
                        </div>
                        <div className="text-3xl font-black tracking-tighter text-[#002b36]">
                            Arbor<span className="text-[#00e676]">IA</span>
                        </div>
                    </div>
                    <div className="text-[7px] text-slate-400 font-bold uppercase tracking-[0.3em] ml-0.5">
                        Forestry Intelligence &bull; Execution Report
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <div className="inline-flex items-center gap-1.5 bg-[#00897b] text-white px-3 py-1 rounded-full text-[9px] font-black tracking-wider mb-1.5 shadow-sm">
                        RELATÓRIO #{execution.id}
                    </div>
                    <div className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.1em] flex items-center justify-end gap-1.5">
                        EMISSÃO: {format(execution.dataEmissao, "dd MMM yyyy", { locale: ptBR })}
                    </div>
                </div>
            </header>

            <div className="h-[2px] bg-slate-900 mb-6"></div>

            {/* Section 01: Identification */}
            <div className="grid grid-cols-12 gap-3 mb-3">
                <div className="col-span-12 bento-card shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-900 text-white w-5 h-5 flex items-center justify-center font-bold rounded-full text-[8px]">01</div>
                            <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Identificação do Ativo</h2>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border bg-rose-50 border-rose-200 text-rose-700">
                            <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                            Risco {tree.nivelRisco}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <DataField label="Código do Ativo" value={tree.codigo} bold />
                        <DataField label="Espécie Botânica" value={tree.especie} italic />
                        <div className="col-span-2">
                            <DataField label="Endereço / Localização" value={tree.localizacao} />
                        </div>
                        <DataField label="DAP (Diâmetro)" value={`${tree.dap}cm`} />
                        <DataField label="Altura Estimada" value={`${tree.altura}m`} />
                        <DataField label="Latitude" value={tree.latitude ? tree.latitude.toFixed(7) : 'Não disponível'} />
                        <DataField label="Longitude" value={tree.longitude ? tree.longitude.toFixed(7) : 'Não disponível'} />
                    </div>
                </div>

                {/* Map */}
                <div className="col-span-12 bento-card min-h-[180px] p-0 overflow-hidden relative shadow-sm">
                    <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-white shadow-sm flex items-center gap-1">
                        <span className="text-[7px] font-black text-slate-900 uppercase tracking-wider">📍 Geolocalização</span>
                    </div>
                    {mapImage ? (
                        <img src={mapImage} className="w-full h-full object-cover" alt="Mapa" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                            <span className="text-[8px] font-bold uppercase">Mapa Georreferenciado</span>
                        </div>
                    )}
                    <div className="absolute bottom-3 right-3 z-10 bg-white/95 p-2 rounded-xl border border-slate-100 shadow-md min-w-[90px]">
                        <span className="text-[7px] font-black text-slate-900 uppercase mb-1 block tracking-widest border-b border-slate-50 pb-0.5">Legenda de Risco</span>
                        <div className="flex flex-col gap-0.5">
                            <LegendItem color="bg-rose-500" label="Alto" />
                            <LegendItem color="bg-amber-500" label="Médio" />
                            <LegendItem color="bg-emerald-500" label="Baixo/Nenhum" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 02: Diagnosis */}
            <div className="grid grid-cols-12 gap-3 mb-3">
                <div className="col-span-12 bg-[#00171f] rounded-[1.5rem] p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-[#00e676] text-white w-5 h-5 flex items-center justify-center font-bold rounded-full text-[8px]">02</div>
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-[#00e676]">Diagnóstico Técnico</h2>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed opacity-95">{execution.diagnostico}</p>
                </div>

                <div className="col-span-12 bento-card flex justify-between items-end shadow-sm">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-slate-900 text-white w-5 h-5 flex items-center justify-center font-bold rounded-full text-[8px]">03</div>
                            <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Intervenção Realizada</h2>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1">
                            {execution.acao}
                        </h3>
                        <p className="text-[9px] text-slate-500 font-medium italic">"{execution.observacoes}"</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 border-l border-slate-50 pl-4 ml-4">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Responsável</span>
                        <span className="text-[9px] font-black text-slate-900 uppercase">{execution.equipe}</span>
                    </div>
                </div>
            </div>

            {/* Section 04-06: Photos */}
            <div className="flex-1 mt-2">
                {execution.fotos.antes.length > 0 && (
                    <div className="mb-4 break-inside-avoid">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-slate-900 text-white px-2 py-0.5 font-bold rounded text-[7px] tracking-widest uppercase">04. REGISTRO ANTES</div>
                            <div className="flex-1 h-[1px] bg-slate-50"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                            {execution.fotos.antes.map((url, idx) => (
                                <div key={idx} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                    <img src={url} className="w-full h-full object-cover" alt="Antes" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {execution.fotos.execucao.length > 0 && (
                    <div className="mb-4 break-inside-avoid">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-emerald-600 text-white px-2 py-0.5 font-bold rounded text-[7px] tracking-widest uppercase">05. REGISTRO EXECUÇÃO</div>
                            <div className="flex-1 h-[1px] bg-slate-50"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                            {execution.fotos.execucao.map((url, idx) => (
                                <div key={idx} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                    <img src={url} className="w-full h-full object-cover" alt="Execução" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {execution.fotos.depois.length > 0 && (
                    <div className="mb-4 break-inside-avoid">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-[#00e676] text-white px-2 py-0.5 font-bold rounded text-[7px] tracking-widest uppercase">06. REGISTRO DEPOIS</div>
                            <div className="flex-1 h-[1px] bg-slate-50"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                            {execution.fotos.depois.map((url, idx) => (
                                <div key={idx} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                    <img src={url} className="w-full h-full object-cover" alt="Depois" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[7px] text-slate-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-3">
                    <span>ArborIA Forestry Intelligence System</span>
                    <span className="text-slate-100">|</span>
                    <span>Ref: {tree.codigo}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-50">
                    <span>PÁGINA 01 / 01</span>
                </div>
            </footer>
        </div>
    );
}

function DataField({ label, value, italic = false, bold = false }: any) {
    return (
        <div className="flex flex-col py-1 border-b border-slate-100/50 last:border-0">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
            <span className={`text-[9px] text-slate-900 ${italic ? 'italic font-medium' : ''} ${bold ? 'font-black' : 'font-bold'} tracking-tight`}>
                {value || 'Não informado'}
            </span>
        </div>
    );
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-1.5 py-0.5">
            <div className={`w-1 h-1 rounded-full ${color}`}></div>
            <span className="text-[6.5px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
    );
}
