import React, { useState } from 'react';
import { DailyLog, AiRoutine } from '../types';
import { generateDailyRoutine, HEALTH_DISCLAIMER } from '../gemini';
import { Sparkles, Sun, Sunrise, Sunset, Wind, X, RefreshCw, KeyRound } from 'lucide-react';

interface AiRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLog: DailyLog;
  apiKey: string;
  onOpenSettings: () => void;
}

export const AiRoutineModal: React.FC<AiRoutineModalProps> = ({
  isOpen,
  onClose,
  currentLog,
  apiKey,
  onOpenSettings,
}) => {
  const [routine, setRoutine] = useState<AiRoutine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Please add your Gemini API Key in Settings first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await generateDailyRoutine(currentLog, apiKey);
      setRoutine(res);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || 'Failed to generate routine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-paper-card dark:bg-paper-darkCard w-full max-w-lg rounded-3xl border border-paper-200 dark:border-paper-darkBorder shadow-xl overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-paper-200 dark:border-paper-darkBorder flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base text-slate-800 dark:text-slate-100">
                AI Routine Generator
              </h2>
              <p className="font-sans text-xs text-slate-400">
                Powered by Gemini 2.5 Flash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!apiKey && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 flex items-start space-x-3 text-sm">
              <KeyRound className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium">Gemini API Key Required</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Add your free Gemini API key to unlock personalized daily rhythms.
                </p>
                <button
                  onClick={onOpenSettings}
                  className="mt-2 text-xs font-semibold underline hover:no-underline"
                >
                  Configure Key in Settings →
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!routine && !loading && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-sage-500 mx-auto mb-3 opacity-80" />
              <h3 className="font-sans font-semibold text-base text-slate-800 dark:text-slate-100">
                Tailored to Today&apos;s Energy ({currentLog.energy}/10)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-5">
                Gemini will craft an unhurried, sustainable rhythm built around your intention.
              </p>
              <button
                onClick={handleGenerate}
                disabled={!apiKey}
                className="px-5 py-2.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Today&apos;s Routine
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-sage-600 animate-spin mx-auto" />
              <p className="text-sm font-sans font-medium text-slate-700 dark:text-slate-300">
                Listening to today&apos;s check-in...
              </p>
              <p className="text-xs text-slate-400">
                Synthesizing calm rhythm with Gemini 2.5 Flash
              </p>
            </div>
          )}

          {routine && !loading && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/30 border border-sage-200 dark:border-sage-800/50">
                <span className="text-xs uppercase tracking-wider font-semibold text-sage-600 dark:text-sage-400">
                  Today&apos;s Theme
                </span>
                <h3 className="font-serif text-lg font-semibold text-sage-900 dark:text-sage-100 mt-0.5">
                  &ldquo;{routine.theme}&rdquo;
                </h3>
              </div>

              {/* Morning */}
              <div className="p-3.5 rounded-xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-ochre-100 dark:bg-ochre-950/40 text-ochre-700 dark:text-ochre-300 shrink-0">
                  <Sunrise className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Morning Rhythm
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {routine.morningBlock}
                  </p>
                </div>
              </div>

              {/* Afternoon */}
              <div className="p-3.5 rounded-xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-sage-100 dark:bg-sage-950/40 text-sage-700 dark:text-sage-300 shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Afternoon Flow
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {routine.afternoonBlock}
                  </p>
                </div>
              </div>

              {/* Evening */}
              <div className="p-3.5 rounded-xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-pond-100 dark:bg-pond-950/40 text-pond-700 dark:text-pond-300 shrink-0">
                  <Sunset className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Evening Wind-Down
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {routine.eveningWindDown}
                  </p>
                </div>
              </div>

              {/* Grounding Exercise */}
              <div className="p-3.5 rounded-xl bg-pond-50 dark:bg-pond-950/20 border border-pond-200 dark:border-pond-800/40 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-pond-100 dark:bg-pond-900/40 text-pond-700 dark:text-pond-300 shrink-0">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-pond-800 dark:text-pond-200 uppercase tracking-tight">
                    2-Minute Grounding
                  </h4>
                  <p className="text-xs text-pond-700 dark:text-pond-300 mt-0.5 leading-relaxed">
                    {routine.mindfulGrounding}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerate}
                  className="flex items-center space-x-1.5 text-xs text-sage-700 dark:text-sage-300 hover:underline font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Rhythm</span>
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-2 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight italic">
              {HEALTH_DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
