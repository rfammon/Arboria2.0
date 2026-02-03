import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  BookOpen,
  BrainCircuit,
  Award,
  Search,
  Book,
  Sprout,
  Leaf,
  TreeDeciduous,
  Shield,
  Scissors,
  ScrollText,
  Droplets,
  Sun,
  Ruler,
  Sparkles,
  RotateCw,
  AlertTriangle
} from 'lucide-react';
import { ContentViewer } from './ContentViewer';
import { PruningPlanActivity } from './PruningPlanActivity';
import { KeyConceptCard } from './KeyConceptCard';
import { useEducationStore } from '../../stores/useEducationStore';
import confetti from 'canvas-confetti';

interface InteractiveLearningExperienceProps {
  content: string;
  topicId: string;
  onComplete: () => void;
  title?: string;
  mode?: 'training' | 'reference';
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizData {
  title: string;
  questions: Question[];
  minScore?: number;
}

interface Card {
  id: number;
  content: string;
  type: 'content' | 'quiz';
  title?: string;
  quizData?: QuizData;
  definitions?: Array<{ term: string, def: string }>;
}

// Robust Audio Helper
const useAudioFeedback = () => {
  const playSuccessWood = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;

    // 1. O "Snap" (Madeira)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    // 2. O "Rustle" (Folhagem)
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    noise.connect(filter);
    filter.connect(noiseGain);

    [gain, noiseGain].forEach(g => g.connect(ctx.destination));

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.1);
  }, []);

  const playCriticalError = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;

    const carrier = ctx.createOscillator();
    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(120, now);

    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    modulator.frequency.value = 173.5;
    modGain.gain.value = 500;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 15;

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.6, now);
    mainGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + 0.5);
  }, []);

  const playWhoosh = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const win = window as Window & { _arboriaAudioCtx?: AudioContext };
      if (!win._arboriaAudioCtx) {
        win._arboriaAudioCtx = new AudioContextClass();
      }
      const ctx = win._arboriaAudioCtx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio feedback failed silently
    }
  }, []);

  const playFeedback = useCallback((type: 'success' | 'error') => {
    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const win = window as Window & { _arboriaAudioCtx?: AudioContext };
      if (!win._arboriaAudioCtx) win._arboriaAudioCtx = new AudioContextClass();
      const ctx = win._arboriaAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'success') playSuccessWood(ctx);
      else playCriticalError(ctx);
    } catch {
      // Audio feedback failed silently
    }
  }, [playSuccessWood, playCriticalError]);

  return { playWhoosh, playFeedback };
};

// Icon Selector Helper
const getIconForTerm = (term: string) => {
  const t = term.toLowerCase();
  if (t.includes('raiz') || t.includes('raízes') || t.includes('solo')) return Sprout;
  if (t.includes('copa') || t.includes('folha') || t.includes('fotossíntese')) return Leaf;
  if (t.includes('fuste') || t.includes('tronco') || t.includes('madeira') || t.includes('caule')) return TreeDeciduous;
  if (t.includes('segurança') || t.includes('epi') || t.includes('capacete') || t.includes('risco')) return Shield;
  if (t.includes('poda') || t.includes('corte') || t.includes('ferramenta') || t.includes('serra')) return Scissors;
  if (t.includes('lei') || t.includes('norma') || t.includes('nr')) return ScrollText;
  if (t.includes('água') || t.includes('irrigação')) return Droplets;
  if (t.includes('luz') || t.includes('sol')) return Sun;
  if (t.includes('medida') || t.includes('dap') || t.includes('altura')) return Ruler;
  if (t.includes('energia') || t.includes('rápido')) return Zap;

  return BrainCircuit;
};

interface QuizComponentProps {
  card: Card;
  inline?: boolean;
  onAdvance?: () => void;
  playFeedback: (type: 'success' | 'error') => void;
  setQuizResults: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  mode?: 'training' | 'reference';
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  card,
  inline = false,
  onAdvance,
  playFeedback,
  setQuizResults,
  mode
}) => {
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Helper to shuffle arrays
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Initialize/Reset Quiz Session
  const initQuiz = useCallback(() => {
    if (!card.quizData) return;

    // Select 4 random questions from pool
    const pool = card.quizData.questions;
    // Ensure we have questions to select from
    if (!pool || pool.length === 0) return;

    const selected = shuffleArray(pool).slice(0, 4);

    // Randomize options for each selected question
    const randomized = selected.map(q => {
      const originalCorrectOption = q.options[q.correctAnswer];
      const shuffledOpts = shuffleArray(q.options);
      const newCorrectIdx = shuffledOpts.indexOf(originalCorrectOption);
      return {
        ...q,
        options: shuffledOpts,
        correctAnswer: newCorrectIdx
      };
    });

    setSessionQuestions(randomized);
    setCurrentQIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setCorrectCount(0);
    setShowSummary(false);
  }, [card.quizData, shuffleArray]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  if (!card.quizData || sessionQuestions.length === 0) return null;

  const currentQuestion = sessionQuestions[currentQIdx];
  const isLastQuestion = currentQIdx === sessionQuestions.length - 1;

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;

    setSelectedOpt(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      playFeedback('success');
      // Automatic transition for correct answers
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    } else {
      playFeedback('error');
      setShowExplanation(true);
    }
  };

  const finishQuiz = () => {
    setShowSummary(true);
    const totalQuestions = sessionQuestions.length;
    const score = (correctCount / totalQuestions) * 10;
    const minScore = 7.5; // Strict requirement: 7.5 threshold
    const passed = score >= minScore;

    if (passed) {
      setQuizResults(prev => ({ ...prev, [card.id]: true }));
      // Centered confetti for success
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#34d399', '#ffffff', '#fbbf24']
      });
    }
  };

  if (showSummary) {
    const totalQuestions = sessionQuestions.length;
    const score = (correctCount / totalQuestions) * 10;
    const minScore = 7.5;
    const passed = score >= minScore;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={passed ? { opacity: 1, scale: 1 } : { x: [0, -10, 10, -10, 10, 0], opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full ${inline ? 'max-w-none' : 'max-w-md mx-auto'}`}
      >
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center relative overflow-hidden">
          {/* Background Accent */}
          <div className={`absolute top-0 left-0 w-full h-2 ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />

          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
            }`}>
            {passed ? <Trophy size={40} /> : <XCircle size={40} />}
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {passed ? 'Parabéns!' : 'Pontos a melhorar'}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            {passed
              ? 'Você superou o desafio com sucesso!'
              : 'Você ainda não atingiu a pontuação mínima de 7.5. Revise o conteúdo e tente novamente.'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nota Final</span>
              <span className={`text-2xl font-black ${passed ? 'text-emerald-500' : 'text-red-500'}`}>{score.toFixed(1)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acertos</span>
              <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{correctCount}/{totalQuestions}</span>
            </div>
          </div>

          {passed ? (
            <button
              onClick={onAdvance}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 shadow-lg shadow-emerald-500/20"
            >
              Prosseguir para Próxima Seção
              <ChevronRight size={18} />
            </button>
          ) : (
            <div className="space-y-3">
              {/* Feedback Granular - Lista de Erros */}
              {sessionQuestions.length > 0 && correctCount < sessionQuestions.length && (
                <div className="text-left bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20 mb-4 animate-in fade-in slide-in-from-bottom-4">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Pontos para Revisão
                  </span>
                  <ul className="space-y-2">
                    {/* Mostra até 3 tópicos baseados nas questões erradas - Simulado, pois não temos tracking por tópico ainda */}
                    <li className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      Recomendamos reler o conteúdo deste módulo, focando nos diagramas e definições chave.
                    </li>
                  </ul>
                </div>
              )}

              <button
                onClick={initQuiz}
                className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <RotateCw size={18} />
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`w-full ${inline ? 'max-w-none' : 'max-w-2xl mx-auto px-4'}`}>
      <motion.div
        layout
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-black/40 border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Progress Bar Top */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 flex">
          {sessionQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-500 ${idx < currentQIdx ? 'bg-emerald-500' :
                idx === currentQIdx ? 'bg-emerald-400' : 'bg-transparent'
                }`}
            />
          ))}
        </div>

        {/* Quiz Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1 block">
              Questão {currentQIdx + 1} de {sessionQuestions.length}
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {mode === 'reference' ? 'Auto-Avaliação' : 'Avaliação de Conhecimento'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <BrainCircuit size={20} />
          </div>
        </div>

        {/* Questions Body */}
        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQIdx}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-8">
                {currentQuestion.text}
              </p>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === currentQuestion.correctAnswer;
                  const isSelected = selectedOpt === optIdx;

                  let buttonStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-emerald-500/30 hover:bg-emerald-50/10";

                  if (isAnswered) {
                    if (isCorrect) {
                      buttonStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]";
                    } else if (isSelected) {
                      buttonStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/50";
                    } else {
                      buttonStyle = "opacity-40 border-slate-100 dark:border-slate-800 bg-transparent text-slate-400 cursor-default";
                    }
                  } else if (isSelected) {
                    buttonStyle = "border-emerald-500 bg-emerald-500 text-white shadow-lg scale-[1.02]";
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(optIdx)}
                      className={`w-full text-left px-6 py-5 rounded-2xl text-base font-bold border-2 transition-all duration-200 flex items-center justify-between group ${buttonStyle}`}
                    >
                      <span className="flex-1">{opt}</span>
                      <AnimatePresence>
                        {isAnswered && isCorrect && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                            <CheckCircle2 size={24} />
                          </motion.div>
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500">
                            <XCircle size={24} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Section */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                        <BookOpen size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Explicação</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {currentQuestion.explanation || "A opção correta foi destacada acima para sua referência."}
                      </p>

                      <button
                        onClick={handleNextQuestion}
                        className="mt-6 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                      >
                        Continuar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export const InteractiveLearningExperience: React.FC<InteractiveLearningExperienceProps> = ({
  content,
  topicId,
  onComplete,
  title,
  mode = 'training'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [mobileView, setMobileView] = useState<'content' | 'activity'>('content');
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});

  // Audio Feedback Hook
  const { playWhoosh, playFeedback } = useAudioFeedback();

  // Handle window resize for mobile view
  useEffect(() => {
    // Logic for resizing if needed
  }, []);

  const { modules, updateModuleProgress, completeModule } = useEducationStore();

  // Load initial progress
  useEffect(() => {
    if (mode === 'training') {
      const module = modules[topicId];
      if (module && module.currentCardIndex > 0 && module.status !== 'completed') {
        setCurrentIndex(module.currentCardIndex);
      }
    }
  }, [topicId, modules, mode]);

  const cards = parseContent(content);
  const totalSteps = mode === 'reference'
    ? cards.filter(c => c.type !== 'quiz').length
    : cards.length + (cards.some(c => c.type === 'quiz') ? 1 : 0);
  const progress = ((currentIndex + (showQuiz ? 1 : 0)) / totalSteps) * 100;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      let nextIndex = currentIndex + 1;

      // No modo consulta, ignoramos cards de quiz
      if (mode === 'reference') {
        while (nextIndex < cards.length && cards[nextIndex].type === 'quiz') {
          nextIndex++;
        }

        if (nextIndex >= cards.length) {
          handleCompletion();
          return;
        }
      }

      setCurrentIndex(nextIndex);
      if (mode === 'training') {
        updateModuleProgress(topicId, nextIndex);
      }
      // Scroll to top on change
      document.getElementById('content-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (mode !== 'reference' && cards.some(c => c.type === 'quiz') && !showQuiz) {
      setShowQuiz(true);
      // Don't update progress here, user needs to pass quiz
    } else {
      handleCompletion();
    }
  };

  const handlePrev = () => {
    if (showQuiz) {
      setShowQuiz(false);
    } else if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      if (mode === 'training') {
        updateModuleProgress(topicId, prevIndex);
      }
    }
  };

  const handleCompletion = () => {
    if (mode === 'reference') {
      onComplete();
      return;
    }

    setShowCelebration(true);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    completeModule(topicId, xpGained + 150);
    setTimeout(() => onComplete(), 3000);
  };

  const currentCard = cards[currentIndex];

  const ReferenceLayout = () => {
    // Filter cards based on content only (no search needed for clean view)
    const filteredCards = cards.filter(card => card.type !== 'quiz');

    return (
      <div className="relative flex flex-col w-full h-full bg-transparent text-slate-900 dark:text-slate-100 overflow-hidden">

        {/* Main Content - Simplified for Reference Mode */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-0" id="reference-scroll-area">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Filtered Content Cards */}
            {filteredCards.map((card) => (
              <section
                key={card.id}
                id={`card-${card.id}`}
                data-card-id={card.id}
                className="reference-section scroll-mt-24"
              >
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
                  {card.title && (
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {String(card.id + 1).padStart(2, '0')}
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                        {card.title}
                      </h2>
                    </div>
                  )}

                  <div className="educational-content prose prose-slate dark:prose-invert prose-lg max-w-none leading-relaxed prose-headings:font-bold prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-img:rounded-2xl">
                    <ContentViewer content={card.content} />
                  </div>

                  {/* Definitions / Flashcards inline - Only in Training Mode */}
                  {card.definitions && card.definitions.length > 0 && mode === 'training' && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BrainCircuit size={14} />
                        Termos Técnicos
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {card.definitions.map((def, i) => (
                          <KeyConceptCard
                            key={i}
                            title={def.term}
                            description={def.def}
                            icon={getIconForTerm(def.term)}
                            color="#10b981"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}

            {filteredCards.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum resultado encontrado</h3>
              </div>
            )}

            <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={onComplete}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
              >
                Voltar ao Início
              </button>
            </footer>
          </div>
        </main>
      </div>
    );
  };

  if (showCelebration) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 max-w-md"
        >
          <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 mx-auto text-emerald-500 shadow-2xl shadow-emerald-500/20 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
            <Award size={64} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Módulo Concluído!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
            Excelente trabalho. Você dominou este tópico e garantiu <span className="text-emerald-500 font-bold">+{xpGained + 150} XP</span> para sua carreira.
          </p>
          <button
            onClick={onComplete}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            Continuar Jornada
          </button>
        </motion.div>
      </div>
    );
  }

  if (mode === 'reference') {
    return <ReferenceLayout />;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">

      {/* 1. Header (Fixed) */}
      <header className="h-16 shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onComplete}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors text-slate-500"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider mb-0.5 text-emerald-600 dark:text-emerald-400">
              Módulo Educacional
            </span>
            <h1 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{title}</h1>
          </div>

        </div>

        <div className="flex items-center gap-4">
          {/* Progress Pills */}
          <div className="hidden md:flex gap-1">
            {cards.map((_, idx) => (
              <button
                key={idx}
                disabled={mode === 'training' && idx > currentIndex}
                onClick={() => {
                  if (idx <= currentIndex) {
                    setCurrentIndex(idx);
                    playWhoosh();
                  }
                }}
                className={`h-2 w-8 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-emerald-500 w-12' :
                  idx < currentIndex ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-800'
                  } ${idx <= currentIndex ? 'cursor-pointer' : 'cursor-default'}`}
              />
            ))}
          </div>

          {mode === 'training' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 rounded-full text-sm font-bold border border-amber-200 dark:border-amber-900/50 shadow-sm">
              <Sparkles size={14} className="fill-amber-500 text-amber-500" />
              <span>{xpGained}</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Content (Split View) */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* LEFT COLUMN: Content Text */}
        <section className={`flex-1 h-full overflow-hidden flex flex-col transition-transform duration-300 ease-in-out ${mobileView === 'content' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } md:w-1/2 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 absolute md:relative inset-0 z-10 md:z-auto`}>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-emerald-500/20 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-emerald-500/40 scrollbar-track-transparent" id="content-scroll-area">
            <div className="max-w-3xl mx-auto pb-24 pt-4 md:pt-8">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800/60 p-8 md:p-14 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${currentIndex}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {currentCard.title && (
                      <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                            {String(currentIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Seção Atual</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                          {currentCard.title}
                        </h2>
                      </div>
                    )}

                    {currentCard.content && (
                      <div className="educational-content prose prose-slate dark:prose-invert prose-lg max-w-none leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-slate-900 dark:prose-strong:text-white prose-img:rounded-3xl prose-img:shadow-xl">
                        <ContentViewer content={currentCard.content} />
                      </div>
                    )}

                    {!currentCard.content && currentCard.type === 'quiz' && (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6">
                          <BrainCircuit size={40} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Pronto para o Desafio?</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs">Revise os pontos importantes e inicie a atividade ao lado.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Mobile Toggle (Floating) */}
          <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-full shadow-xl border border-white/10">
            <button
              onClick={() => setMobileView('content')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mobileView === 'content' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
            >
              <Book size={16} className="inline mr-2" />
              Leitura
            </button>
            <button
              onClick={() => setMobileView('activity')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mobileView === 'activity' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
            >
              <BrainCircuit size={16} className="inline mr-2" />
              Atividade
              {(currentCard.definitions?.length || 0) > 0 && <span className="ml-1.5 bg-slate-800 px-1.5 py-0.5 rounded-full text-[10px] text-emerald-400">{currentCard.definitions?.length}</span>}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive / Quiz */}
        <section className={`flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-emerald-500/20 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-emerald-500/40 scrollbar-track-transparent absolute md:relative inset-0 z-20 md:z-auto transition-transform duration-300 ${mobileView === 'activity' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          }`}>
          <div className="h-full p-6 md:p-12 flex flex-col justify-center max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`activity-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full space-y-8"
              >
                {/* 1. QUIZ RENDER */}
                {currentCard.type === 'quiz' && (
                  <QuizComponent
                    card={currentCard}
                    onAdvance={handleNext}
                    playFeedback={playFeedback}
                    setQuizResults={setQuizResults}
                    mode={mode}
                  />
                )}

                {/* 2. PRUNING PLAN ACTIVITY (BLOOM: CREATE) */}
                {currentCard.title?.toLowerCase().includes('plano de poda') && currentCard.type !== 'quiz' && (
                  <PruningPlanActivity onComplete={(xp) => {
                    setXpGained(prev => prev + xp);
                    playFeedback('success');
                    handleNext();
                  }} />
                )}

                {/* 3. FLASHCARDS (If Definitions exist) */}
                {currentCard.definitions && currentCard.definitions.length > 0 && currentCard.type !== 'quiz' && !currentCard.title?.includes('Plano de Poda') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider flex items-center gap-2">
                        <BrainCircuit size={16} />
                        Conceitos Chave
                      </h3>
                      <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                        {currentCard.definitions.length} termos
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {currentCard.definitions.map((def, i) => (
                        <KeyConceptCard
                          key={i}
                          title={def.term}
                          description={def.def}
                          icon={getIconForTerm(def.term)}
                          color="#10b981"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PLACEHOLDER ILLUSTRATION (If no quiz or defs) */}
                {currentCard.type === 'content' && (!currentCard.definitions || currentCard.definitions.length === 0) && (
                  <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 opacity-30">
                    <BookOpen size={120} strokeWidth={0.5} />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* 3. Footer Navigation (Fixed) */}
      <footer className="shrink-0 h-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-50">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentIndex === 0
            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest hidden sm:block mr-4">
            {Math.round(progress)}% Completo
          </span>

          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 group ${mode === 'training' && currentCard.type === 'quiz' && !quizResults[currentCard.id]
              ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed shadow-none text-slate-500 dark:text-slate-600'
              : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
          >
            <span className="hidden sm:inline">{currentIndex === cards.length - 1 ? 'Concluir Módulo' : 'Próximo Tópico'}</span>
            <span className="sm:hidden">Próximo</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
};

// --- Helper: Parse Markdown Content ---
function parseContent(fullContent: string): Card[] {
  if (!fullContent) return [];

  // 1. Remove Top Level Header (# Title) to clean up start
  const cleanContent = fullContent.replace(/^#\s+.+\n/, '');

  // 2. Identify Sections
  // Split by ## Headers
  let sectionsRaw = cleanContent.split(/(?=^##\s+)/m).filter(s => s.trim().length > 0);

  // Fallback: If no ## headers found, treat the whole text as one section
  if (sectionsRaw.length === 0 && cleanContent.trim().length > 0) {
    sectionsRaw = [`## Introdução\n${cleanContent}`];
  }

  return sectionsRaw.map((section, index) => {
    // Extract Title
    const titleMatch = section.match(/^##\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Tópico ${index + 1}`;

    // Remove title line
    let content = section.replace(/^##\s+.+$/m, '').trim();

    // extract Definitions
    const definitions: Array<{ term: string, def: string }> = [];
    const defRegex = /^\s*-\s*\*\*(.+?)\*\*:?\s*(.+)$/gm;
    let match;
    while ((match = defRegex.exec(content)) !== null) {
      definitions.push({ term: match[1], def: match[2] });
    }

    // Extract JSON Quiz Data
    let quizData: QuizData | undefined;
    const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/m;
    const jsonMatch = content.match(jsonBlockRegex);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.type === 'quiz' || parsed.questions) {
          quizData = parsed;
          // Remove the JSON block from the visible content
          content = content.replace(jsonBlockRegex, '').trim();
        }
      } catch (e) {
        console.warn('Failed to parse quiz JSON', e);
      }
    }

    // Heuristic for Quiz if no JSON found (legacy support or fallback)
    const isQuizLegacy = (title.toLowerCase().includes('quiz') ||
      title.toLowerCase().includes('avaliação') ||
      title.toLowerCase().includes('teste')) && !quizData;

    return {
      id: index,
      title,
      content,
      type: (quizData || isQuizLegacy) ? 'quiz' : 'content',
      definitions: definitions.length > 0 ? definitions : undefined,
      quizData
    };
  });
}
