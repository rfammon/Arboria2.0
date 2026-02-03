import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Award, Library, ArrowRight } from 'lucide-react';

export type LearningMode = 'training' | 'reference';

interface ModeSelectorProps {
  onSelect: (mode: LearningMode) => void;
  topicTitle: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, topicTitle }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] w-full p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 max-w-3xl"
      >
        <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-4 block">
          Escolha seu Fluxo
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
          Como você deseja aprender sobre <span className="text-emerald-500">{topicTitle}</span>?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium">
          Selecione a experiência que melhor se adapta ao seu objetivo agora.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Mode: Training */}
        <motion.div
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('training')}
          className="group relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-start overflow-hidden transition-all duration-300 group-hover:border-emerald-500/50 group-hover:shadow-2xl group-hover:shadow-emerald-500/10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-8 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:rotate-12">
              <Award size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Treinamento Certificado
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              Jornada guiada e linear. Ganhe XP, conquiste certificados e valide seu conhecimento com avaliações obrigatórias.
            </p>
            
            <ul className="space-y-3 mb-10 text-sm font-bold text-slate-500 dark:text-slate-500">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Trilha de aprendizado linear</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Avaliações e Quizzes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Certificado de conclusão</span>
              </li>
            </ul>

            <div className="mt-auto flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
              <span>Começar Jornada</span>
              <ArrowRight size={18} />
            </div>
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          </div>
        </motion.div>

        {/* Mode: Reference */}
        <motion.div
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('reference')}
          className="group relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-start overflow-hidden transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400 transition-transform duration-500 group-hover:-rotate-12">
              <Library size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Consulta Rápida
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              Acesso livre à biblioteca. Navegue entre os tópicos rapidamente sem bloqueios ou gamificação. Ideal para campo.
            </p>

            <ul className="space-y-3 mb-10 text-sm font-bold text-slate-500 dark:text-slate-500">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Navegação totalmente livre</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Pular seções à vontade</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Quizzes não bloqueantes</span>
              </li>
            </ul>

            <div className="mt-auto flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
              <span>Abrir Biblioteca</span>
              <ArrowRight size={18} />
            </div>

            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
        </motion.div>
      </div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => window.history.back()}
        className="mt-16 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm transition-colors flex items-center gap-2"
      >
        <ChevronRight size={16} className="rotate-180" />
        Voltar para a Biblioteca
      </motion.button>
    </div>
  );
};
