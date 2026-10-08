// IdeasAndCertVault: Project ideas logger & Certification Study Vault
// Powered by Gemini 3.8 Flash architecture refinement
// STRICT RULE: No yellow emojis.

import { useState } from 'react';
import { ProjectIdea, UiMode } from '../types';
import { refineIdea } from '../gemini';
import { Sparkles, Trash2, CheckCircle2, Award, Lightbulb, ArrowRight } from 'lucide-react';
import { TechBadge } from './TechBadge';

interface IdeasAndCertVaultProps {
  ideas: ProjectIdea[];
  uiMode: UiMode;
  apiKey?: string;
  certTargets: string[];
  onAddIdea: (idea: ProjectIdea) => void;
  onDeleteIdea: (id: string) => void;
  onAddCertTarget: (cert: string) => void;
  onRemoveCertTarget: (cert: string) => void;
}

export function IdeasAndCertVault({
  ideas,
  uiMode,
  apiKey,
  certTargets,
  onAddIdea,
  onDeleteIdea,
  onAddCertTarget,
  onRemoveCertTarget,
}: IdeasAndCertVaultProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<'freelance' | 'side_project' | 'certification'>('side_project');
  const [newCert, setNewCert] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    let techStack: string[] = [];
    let roadmap: string[] = [];
    let valueProposition = '';

    // If notes exist, optionally run quick Gemini 3.8 Flash refinement
    if (newNotes.trim() && apiKey) {
      setIsRefining(true);
      try {
        const refined = await refineIdea(newTitle, newCategory, apiKey);
        techStack = refined.techStack;
        roadmap = refined.roadmap;
        valueProposition = refined.valueProposition;
      } catch (e) {
        console.warn('Gemini 3.8 Flash idea refinement skipped:', e);
      } finally {
        setIsRefining(false);
      }
    }

    const item: ProjectIdea = {
      id: `idea_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      notes: newNotes.trim(),
      status: 'backlog',
      techStack,
      roadmap,
      valueProposition,
      createdAt: new Date().toISOString(),
    };

    onAddIdea(item);
    setNewTitle('');
    setNewNotes('');
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.trim()) return;
    onAddCertTarget(newCert.trim());
    setNewCert('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Certification Target Tracking Strip */}
      <div className="p-4 rounded-2xl bg-[#0B1020]/80 backdrop-blur-xl border border-amber-500/30 shadow-[0_0_20px_rgba(255,184,0,0.1)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-amber-300">
              ACTIVE CERTIFICATION STUDY TARGETS
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {certTargets.length} TARGETS IN PROGRESS
          </span>
        </div>

        {/* Target Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {certTargets.map((cert) => (
            <div
              key={cert}
              className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{cert}</span>
              <button
                onClick={() => onRemoveCertTarget(cert)}
                className="text-amber-400 hover:text-white transition-colors"
                title="Remove certification target"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Add Cert Form */}
        <form onSubmit={handleAddCert} className="flex gap-2">
          <input
            type="text"
            placeholder="Add target cert (e.g. AWS Solutions Architect, GCP Cloud Engineer, CKA)..."
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            className="flex-1 rounded-lg bg-[#050811] border border-slate-700 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all"
          >
            [+ ADD CERT]
          </button>
        </form>
      </div>

      {/* 2. Project & Freelance Ideas Log */}
      <div className="p-5 rounded-2xl bg-[#0B1020]/80 backdrop-blur-xl border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300">
              BUILDING & FREELANCE IDEAS VAULT
            </h3>
          </div>
          <TechBadge mode={uiMode} type="dev" size="sm" />
        </div>

        {/* Add Idea Card */}
        <div className="p-3.5 rounded-xl bg-[#060A14] border border-slate-800 space-y-3 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Idea / Feature Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 rounded bg-[#0A0F1D] border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="rounded bg-[#0A0F1D] border border-slate-700 px-2 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="side_project">[SIDE PROJECT]</option>
              <option value="freelance">[FREELANCE CONTRACT]</option>
              <option value="certification">[CERT STUDY TOOL]</option>
            </select>
          </div>

          <textarea
            rows={2}
            placeholder="Quick concept or client requirements (Gemini 3.8 Flash will auto-generate tech stack & roadmap)..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full rounded bg-[#0A0F1D] border border-slate-700 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />

          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || isRefining}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRefining ? 'ANALYZING VIA GEMINI 3.8...' : 'COMMIT IDEA'}</span>
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-4 rounded-xl bg-[#080D1A]/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 uppercase">
                      [{idea.category.replace('_', ' ')}]
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {idea.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => onDeleteIdea(idea.id)}
                    className="text-slate-500 hover:text-pink-400 transition-colors p-1"
                    title="Delete idea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {idea.notes && (
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-2.5">
                    {idea.notes}
                  </p>
                )}

                {/* Tech Stack Pills */}
                {idea.techStack && idea.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {idea.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[10px] font-mono text-cyan-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Roadmap Milestones */}
                {idea.roadmap && idea.roadmap.length > 0 && (
                  <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-300">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      EXECUTION ROADMAP:
                    </div>
                    {idea.roadmap.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
