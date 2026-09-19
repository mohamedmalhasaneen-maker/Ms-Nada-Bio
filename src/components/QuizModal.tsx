import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizQuestion, AnatomicalItem } from '../types';
import { QUIZ_QUESTIONS, ANATOMICAL_ITEMS } from '../data/anatomyData';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  Crosshair,
  ArrowLeft
} from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnatomicalItem: (item: AnatomicalItem) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onSelectAnatomicalItem,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentIndex];
  const relatedItem = ANATOMICAL_ITEMS[currentQ.relatedItemId];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Smoothly focus 3D model onto the relevant anatomical item for visual reinforcement!
    if (relatedItem) {
      onSelectAnatomicalItem(relatedItem);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (score >= QUIZ_QUESTIONS.length * 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                اختبار المعرفة التشريحية التفاعلي
              </h3>
              <p className="text-xs text-slate-400">
                أسئلة علمية مع ربط مباشر بالنموذج ثلاثي الأبعاد
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {!showResult ? (
            <>
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>السؤال {currentIndex + 1} من {QUIZ_QUESTIONS.length}</span>
                  <span className="font-mono text-emerald-400">النقاط: {score}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                  {currentQ.questionAr}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.optionsAr.map((opt, idx) => {
                  let btnStyle = 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-200';

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40';
                    } else if (selectedOption === idx) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'opacity-40 border-slate-800 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-right p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && selectedOption === idx && idx !== currentQ.correctIndex && (
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & 3D Focus notice */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-500/30 space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                      <Sparkles className="w-4 h-4" />
                      <span>الشرح والتحليل العلمي:</span>
                    </div>
                    {relatedItem && (
                      <span className="text-[11px] text-teal-400 flex items-center gap-1">
                        <Crosshair className="w-3 h-3" />
                        <span>تم توجيه الكاميرا 3D للعضو</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentQ.explanationAr}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Result Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40">
                <Award className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold text-white">
                اكتمل الاختبار بنجاح!
              </h4>

              <p className="text-sm text-slate-300">
                حصلت على <span className="font-bold text-emerald-400 text-lg">{score}</span> من أصل <span className="font-bold text-white">{QUIZ_QUESTIONS.length}</span> إجابات صحيحة
              </p>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 max-w-md mx-auto">
                {score >= 6
                  ? 'أداء متميز واستيعاب عالي للتشريح البشري وميكانيكا الأعضاء!'
                  : 'أداء جيد! يمكنك مراجعة بطاقات المعلومات التشريحية وإعادة المحاولة لتحقيق نتيجة أعلى.'}
              </div>

              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-teal-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الاختبار</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showResult && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isAnswered ? 'انتقل للسؤال التالي' : 'اختر الإجابة المناسبة للمتابعة'}
            </span>

            {isAnswered && (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors"
              >
                <span>{currentIndex === QUIZ_QUESTIONS.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
