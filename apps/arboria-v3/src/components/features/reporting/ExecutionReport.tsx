import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportMap } from './ReportMap';
import { CheckCircle2, AlertTriangle, Info, MapPin, Camera, Calendar, User, Zap } from 'lucide-react';

interface TreeData {
  id: string;
  codigo: string;
  especie: string;
  localizacao: string;
  nivelRisco: 'Baixo' | 'Médio' | 'Alto';
  altura: number;
  dap: number;
  fotoUrl: string;
  latitude?: number;
  longitude?: number;
}

interface ExecutionData {
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

export interface ExecutionReportProps {
  id?: string;
  dataEmissao?: Date;
  tree?: TreeData;
  execution?: ExecutionData;
}

/**
 * ExecutionReport Component
 * Premium "ArborIA-style" layout optimized for A4 printing.
 */
const ExecutionReport: React.FC<ExecutionReportProps> = ({
  id = "EXE-2026-000",
  dataEmissao = new Date(),
  tree,
  execution
}) => {
  // const [mapCaptured, setMapCaptured] = useState(false);

  const riskStyles = {
    'Baixo': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />
    },
    'Médio': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      icon: <Info className="w-3 h-3 text-amber-600" />
    },
    'Alto': {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      icon: <AlertTriangle className="w-3 h-3 text-rose-600" />
    }
  }[tree?.nivelRisco || 'Baixo'];

  return (
    <div className="bg-white print:bg-white antialiased text-slate-900 overflow-visible">
      {/* A4 Page Container */}
      <div className="mx-auto w-[210mm] min-h-[297mm] p-[10mm] flex flex-col print:p-[8mm] print:w-full print:shadow-none bg-white relative">
        
        {/* 1. Header - Unified Style (ArborIA Brand) */}
        <header className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#002B36] rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-[#00E676] rounded-full"></div>
              </div>
              <div className="text-3xl font-black tracking-tighter text-[#002B36]">
                Arbor<span className="text-[#00E676]">IA</span>
              </div>
            </div>
            <div className="text-[7px] text-slate-400 font-bold uppercase tracking-[0.3em] ml-0.5">
              Forestry Intelligence &bull; Execution Report
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-1.5 bg-[#00897B] text-white px-3 py-1 rounded-full text-[9px] font-black tracking-wider mb-1.5 shadow-sm">
              <Zap className="w-2.5 h-2.5 text-white" />
              RELATÓRIO #{id}
            </div>
            <div className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.1em] flex items-center justify-end gap-1.5">
              <Calendar className="w-2.5 h-2.5" />
              EMISSÃO: {format(dataEmissao, "dd MMM yyyy", { locale: ptBR })}
            </div>
          </div>
        </header>

        {/* Strong separation line */}
        <div className="h-[2px] bg-slate-900 mb-6"></div>

        {/* 2. Main Bento Grid (Inventory & Location) */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Tree Info Card */}
          <div className="col-span-12 bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100 flex flex-col justify-between break-inside-avoid shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 text-white w-5 h-5 flex items-center justify-center font-bold rounded-full text-[8px]">01</div>
                <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Identificação do Ativo</h2>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${riskStyles.bg} ${riskStyles.border} ${riskStyles.text}`}>
                <span className={`w-1 h-1 rounded-full ${riskStyles.dot}`}></span>
                Risco {tree?.nivelRisco}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <DataField label="Código do Ativo" value={tree?.codigo} bold />
              <DataField label="Espécie Botânica" value={tree?.especie} italic />
              <div className="col-span-2">
                <DataField label="Endereço / Localização" value={tree?.localizacao} />
              </div>
              <DataField label="DAP (Diâmetro)" value={`${tree?.dap}cm`} />
              <DataField label="Altura Estimada" value={`${tree?.altura}m`} />
              <DataField label="Latitude" value={tree?.latitude ? tree.latitude.toFixed(7) : 'Não disponível'} />
              <DataField label="Longitude" value={tree?.longitude ? tree.longitude.toFixed(7) : 'Não disponível'} />
            </div>
          </div>

          {/* Map Card */}
          <div className="col-span-12 bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100 relative min-h-[180px] break-inside-avoid shadow-sm">
             <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-white shadow-sm flex items-center gap-1">
                <MapPin className="w-2 h-2 text-emerald-600" />
                <span className="text-[7px] font-black text-slate-900 uppercase tracking-wider">Geolocalização</span>
             </div>
              {(!!tree?.latitude && !!tree?.longitude) ? (
               <div className="w-full h-full min-h-[180px] relative">
                   <ReportMap 
                   trees={[{
                     id: tree?.id || 'target',
                     especie: tree?.especie || 'N/A',
                     dap: tree?.dap || 0,
                     altura: tree?.altura || 0,
                     risco: tree?.nivelRisco || 'Baixo',
                     latitude: tree?.latitude,
                     longitude: tree?.longitude
                   }]} 
                   onLoad={() => {}}
                 />
                 {/* Legend Overlay */}
                 <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-slate-100 shadow-md min-w-[90px]">
                   <span className="text-[7px] font-black text-slate-900 uppercase mb-1 block tracking-widest border-b border-slate-50 pb-0.5">Legenda de Risco</span>
                   <div className="flex flex-col gap-0.5">
                     <LegendItem color="bg-rose-500" label="Alto" />
                     <LegendItem color="bg-amber-500" label="Médio" />
                     <LegendItem color="bg-emerald-500" label="Baixo/Nenhum" />
                   </div>
                 </div>
               </div>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 bg-slate-100/50">
                 <MapPin className="w-5 h-5 opacity-20" />
                 <span className="text-[8px] font-bold uppercase tracking-widest">Localização não disponível</span>
               </div>
             )}
          </div>
        </div>

        {/* 3. Execution Bento Section */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Diagnosis */}
          <div className="col-span-12 bg-[#00171F] rounded-[1.5rem] p-4 text-white break-inside-avoid shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-[#00E676] text-white w-5 h-5 flex items-center justify-center font-bold rounded-full text-[8px]">02</div>
              <h2 className="text-[9px] font-black uppercase tracking-widest text-[#00E676]">Diagnóstico Técnico</h2>
            </div>
            <p className="text-[11px] font-medium leading-relaxed opacity-95">{execution?.diagnostico || 'Tarefa gerada autom. do plano'}</p>
          </div>

          {/* Action */}
          <div className="col-span-12 bg-white rounded-[1.5rem] p-4 border border-slate-100 break-inside-avoid shadow-sm flex justify-between items-end">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-slate-900 text-white w-5 h-5 flex items-center justify-center font-bold rounded-full text-[8px]">03</div>
                <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Intervenção Realizada</h2>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1">
                {execution?.acao}
              </h3>
              <p className="text-[9px] text-slate-500 font-medium italic">"{execution?.observacoes || 'Execução concluída sem intercorrências.'}"</p>
            </div>
            
            <div className="flex flex-col items-end gap-1 border-l border-slate-50 pl-4 ml-4">
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Responsável</span>
               <div className="flex items-center gap-1.5">
                  <User className="w-2.5 h-2.5 text-slate-400" />
                  <span className="text-[9px] font-black text-slate-900 uppercase">{execution?.equipe}</span>
               </div>
            </div>
          </div>
        </div>

        {/* 4. Photos Gallery - Categorized */}
        <div className="flex-1 break-inside-avoid mt-2">
          {((execution?.fotos?.antes?.length || 0) > 0) && (
            <PhotoSection title="04. REGISTRO ANTES" photos={execution!.fotos.antes} color="bg-slate-900" />
          )}
          
          {((execution?.fotos?.execucao?.length || 0) > 0) && (
            <PhotoSection title="05. REGISTRO EXECUÇÃO" photos={execution!.fotos.execucao} color="bg-emerald-600" />
          )}

          {((execution?.fotos?.depois?.length || 0) > 0) && (
            <PhotoSection title="06. REGISTRO DEPOIS" photos={execution!.fotos.depois} color="bg-[#00E676]" />
          )}

          {(!execution?.fotos || ((execution.fotos.antes.length === 0 && execution.fotos.execucao.length === 0 && execution.fotos.depois.length === 0))) && (
            <div className="py-8 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
              <Camera className="w-5 h-5 text-slate-200 mb-1.5" />
              <span className="text-[8px] font-bold text-slate-300 uppercase">Sem evidências fotográficas</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[7px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span>ArborIA Forestry Intelligence System</span>
            <span className="text-slate-100">|</span>
            <span>Ref: {tree?.codigo}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-50">
             <span>PÁGINA</span>
             <span className="text-slate-900 font-black">01 / 01</span>
          </div>
        </footer>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0mm; }
          html, body { 
            height: auto !important; 
            overflow: visible !important; 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .mx-auto { margin: 0 !important; width: 100% !important; border: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Fix for Chrome 1.0 scale printing */
          body { 
            font-size: 9pt;
            line-height: 1.2;
          }
        }
      `}} />
    </div>
  );
};

const DataField = ({ label, value, italic = false, bold = false }: { label: string, value: string | number | undefined, italic?: boolean, bold?: boolean }) => (
  <div className="flex flex-col py-1 border-b border-slate-100/50 last:border-0">
    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
    <span className={`text-[9px] text-slate-900 ${italic ? 'italic font-medium' : ''} ${bold ? 'font-black' : 'font-bold'} tracking-tight`}>
      {value || 'Não informado'}
    </span>
  </div>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-1.5 py-0.5">
    <div className={`w-1 h-1 rounded-full ${color}`}></div>
    <span className="text-[6.5px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

const PhotoSection = ({ title, photos, color }: { title: string, photos: string[], color: string }) => (
  <div className="mb-4 break-inside-avoid">
    <div className="flex items-center gap-2 mb-3">
      <div className={`${color} text-white px-2 py-0.5 font-bold rounded text-[7px] tracking-widest uppercase`}>{title}</div>
      <div className="flex-1 h-[1px] bg-slate-50"></div>
    </div>
    <div className="grid grid-cols-4 gap-2.5">
      {photos.map((url, idx) => (
        <div key={idx} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group">
          <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
);

export default ExecutionReport;
