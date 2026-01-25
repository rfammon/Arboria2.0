import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TreeData {
  id: string;
  codigo: string;
  especie: string;
  localizacao: string;
  nivelRisco: 'Baixo' | 'Médio' | 'Alto';
  altura: number;
  dap: number;
  fotoUrl: string;
}

interface ExecutionData {
  diagnostico: string;
  acao: string;
  observacoes: string;
  equipe: string;
  fotoDepoisUrl: string;
}

export interface ExecutionReportProps {
  id?: string;
  dataEmissao?: Date;
  tree?: TreeData;
  execution?: ExecutionData;
}

/**
 * ExecutionReport Component
 * Optimized for A4 printing (210mm x 297mm)
 */
const ExecutionReport: React.FC<ExecutionReportProps> = ({
  id = "EXE-2026-042",
  dataEmissao = new Date(),
  tree = {
    id: "tree-001",
    codigo: "ARB-7742",
    especie: "Tipuana tipu (Tipuana)",
    localizacao: "Parque Central - Setor A, Quadra 4",
    nivelRisco: "Alto",
    altura: 12.5,
    dap: 45,
    fotoUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1000&auto=format&fit=crop"
  },
  execution = {
    diagnostico: "Presença de fungos xilófagos na base do tronco e inclinação acentuada (>15°) em direção à via pública. Risco iminente de queda em evento de ventos fortes.",
    acao: "Poda de Equilíbrio e Redução de Copa",
    observacoes: "Removidos galhos secundários com sinais de necrose. Aplicado selante antifúngico nos cortes superiores. Recomenda-se nova inspeção em 6 meses.",
    equipe: "Eng. Ricardo Santos (CREA-SP 50702133)",
    fotoDepoisUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1000&auto=format&fit=crop"
  }
}) => {
  const riskColor = {
    'Baixo': 'bg-green-100 text-green-800 border-green-200',
    'Médio': 'bg-orange-100 text-orange-800 border-orange-200',
    'Alto': 'bg-red-100 text-red-800 border-red-200'
  }[tree?.nivelRisco || 'Baixo'] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-4 print:p-0 print:bg-white antialiased">
      {/* A4 Page Container */}
      <div className="mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] w-[210mm] min-h-[297mm] p-[15mm] flex flex-col print:shadow-none print:w-full print:p-[10mm] print:mx-0">
        
        {/* 1. Header */}
        <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex flex-col">
            <div className="text-4xl font-extrabold tracking-tighter text-slate-900">
              Arbor<span className="text-[#2e7d32]">IA</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-1">
              Smart Forest Management
            </div>
          </div>
          
          <div className="text-center flex-1 px-8 pt-2">
            <h1 className="text-2xl font-black uppercase text-slate-800 leading-tight">
              Relatório Técnico de Execução
            </h1>
            <div className="h-1 w-24 bg-[#2e7d32] mx-auto mt-2"></div>
          </div>
          
          <div className="text-right pt-2">
            <div className="bg-slate-900 text-white px-3 py-1 text-xs font-bold mb-1">
              ID: {id}
            </div>
            <div className="text-slate-500 text-[11px] font-medium">
              EMISSÃO: {format(dataEmissao, "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </div>
        </header>

        {/* 2. Tree Context (Inventory) */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#2e7d32] text-white w-8 h-8 flex items-center justify-center font-bold rounded-sm text-sm">01</div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Contexto do Ativo (Inventário)
            </h2>
            <div className="flex-1 h-[2px] bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-8 items-start">
            <div className="relative group">
              <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm">
                <img src={tree?.fotoUrl || '/placeholder-tree.jpg'} alt="Ativo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white border border-slate-200 shadow-md px-4 py-2 rounded-lg">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registro</span>
                <span className="text-xs font-bold text-slate-700 uppercase">INICIAL</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <DataField label="Código do Ativo" value={tree?.codigo} bold />
              <DataField label="Espécie Botânica" value={tree?.especie} italic />
              <DataField label="Localização" value={tree?.localizacao} />
              <DataField label="Dimensões Médias" value={`Altura: ${tree?.altura}m | DAP: ${tree?.dap}cm`} />
              
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nível de Risco</span>
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border-2 ${riskColor}`}>
                  {tree?.nivelRisco}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Intervention Details (Execution) */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#2e7d32] text-white w-8 h-8 flex items-center justify-center font-bold rounded-sm text-sm">02</div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Dados de Execução e Manejo
            </h2>
            <div className="flex-1 h-[2px] bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="text-[11px] font-black text-[#2e7d32] uppercase tracking-widest mb-3">Diagnóstico Técnico</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{execution?.diagnostico || 'Não informado'}</p>
              </div>
              <div className="bg-[#2e7d32]/5 p-5 rounded-xl border border-[#2e7d32]/10">
                <h3 className="text-[11px] font-black text-[#2e7d32] uppercase tracking-widest mb-3">Ação Realizada</h3>
                <p className="text-md font-bold text-[#2e7d32] leading-snug">{execution?.acao}</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-100 p-5 rounded-xl">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Observações Adicionais</h3>
              <p className="text-sm text-slate-600 italic leading-relaxed text-balance">"{execution?.observacoes || 'Sem observações.'}"</p>
            </div>

            <div className="flex justify-between items-end pt-4 px-2">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Responsável pela Execução</span>
                <p className="text-sm font-bold text-slate-800">{execution?.equipe}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="w-48 h-[1px] bg-slate-300 mb-2"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Assinatura / Carimbo</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Evidence (Photos Comparison) */}
        <section className="mb-10 flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#2e7d32] text-white w-8 h-8 flex items-center justify-center font-bold rounded-sm text-sm">03</div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Evidências: Comparativo de Manejo
            </h2>
            <div className="flex-1 h-[2px] bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm">
                <img src={tree?.fotoUrl || '/placeholder-tree.jpg'} alt="Antes" className="w-full h-full object-cover grayscale-[0.3]" />
              </div>
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest text-center">Estado Anterior</p>
            </div>
            <div className="space-y-3">
              <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border-2 border-[#2e7d32]/20 shadow-sm relative">
                {execution?.fotoDepoisUrl ? (
                  <img src={execution.fotoDepoisUrl} alt="Depois" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">Sem registro fotográfico</div>
                )}
                <div className="absolute top-3 right-3 bg-[#2e7d32] text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-tighter">
                  Sucesso
                </div>
              </div>
              <p className="text-[11px] font-black uppercase text-[#2e7d32] tracking-widest text-center">Conclusão Técnica</p>
            </div>
          </div>
        </section>

        {/* 5. Footer */}
        <footer className="border-t-4 border-slate-900 pt-6 mt-auto flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex flex-col gap-1">
            <span>SISTEMA ARBOIA &bull; GESTÃO INTELIGENTE</span>
          </div>
          <div className="text-center bg-slate-50 px-6 py-2 rounded-full text-slate-600 border border-slate-100">
            Documento Autêntico Gerado em {format(new Date(), "dd/MM/yyyy HH:mm")}
          </div>
          <div className="flex items-center gap-2">
            PÁGINA <span className="text-slate-900 bg-slate-100 w-6 h-6 flex items-center justify-center rounded-sm">01</span>
          </div>
        </footer>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}} />
    </div>
  );
};

const DataField = ({ label, value, italic = false, bold = false }: any) => (
  <div className="flex flex-col py-2 border-b border-slate-100">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
    <span className={`text-sm text-slate-800 ${italic ? 'italic font-medium' : ''} ${bold ? 'font-black' : 'font-semibold'}`}>{value}</span>
  </div>
);

export default ExecutionReport;
