// IdeasAndCertVault: Cyberware Blueprints & Neural Shards Vault
// Styled with Cyberpunk 2077 chamfered borders, yellow hazard tabs, and Gemini 3.8 Flash analysis.
// STRICT: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState } from 'react';
import { ProjectIdea, UiMode } from '../types';
import { refineIdea } from '../gemini';
import { Sparkles, Trash2, Award, Lightbulb, ArrowRight, Cpu } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

interface IdeasAndCertVaultProps {
  ideas: ProjectIdea[];
  uiMode: UiMode;
  certTargets: string[];
  onAddIdea: (idea: ProjectIdea) => void;
  onDeleteIdea: (id: string) => void;
  onAddCertTarget: (cert: string) => void;
  onRemoveCertTarget: (cert: string) => void;
}

export function IdeasAndCertVault({
  ideas,
  uiMode,
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
    playCyberClick();

    let techStack: string[] = [];
    let roadmap: string[] = [];
    let valueProposition = '';

    if (newNotes.trim()) {
      setIsRefining(true);
      try {
        const refined = await refineIdea(newTitle, newCategory);
        techStack = refined.techStack;
        roadmap = refined.roadmap;
        valueProposition = refined.valueProposition;
      } catch (e) {
        console.warn('Gemini 3.8 Flash refinement fallback:', e);
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
    playCyberAlert();
    onAddCertTarget(newCert.trim());
    setNewCert('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Neural Shards / Certification Target Tracker */}
      <div className="cyber-redone-container p-6 relative mb-6">
        {/* Top corner hazard stripe */}
        <div className="absolute top-0 right-0 w-28 h-2.5 hazard-stripe" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#FCEE0A]" />
            <h3 className="font-cyber text-sm font-black tracking-wider uppercase text-[#FCEE0A]">
              {uiMode === 'serious'
                ? 'CERTIFICATION ROADMAP & TARGETS'
                : 'ACTIVE NEURAL SHARDS // CERT TARGETS'}
            </h3>
          </div>
          <span className="font-tech text-xs text-slate-300">
            {uiMode === 'serious'
              ? `[${certTargets.length} ACTIVE CERTIFICATIONS]`
              : `[${certTargets.length} SHARDS INSTALLED]`}
          </span>
        </div>

        {/* Shard Chips */}
        <div className="flex flex-wrap gap-2.5 mb-4">
          {certTargets.map((cert) => (
            <div
              key={cert}
              className="px-3.5 py-2 bg-[#121422] border-l-4 border-l-[#FCEE0A] border border-slate-700/80 text-white font-hud font-bold text-sm flex items-center gap-2.5 cyber-cut hover:border-[#FCEE0A] transition-colors"
            >
              <Award className="w-4 h-4 text-[#FCEE0A]" />
              <span>{cert}</span>
              <button
                onClick={() => onRemoveCertTarget(cert)}
                className="text-slate-500 hover:text-[#FF003C] transition-colors font-mono text-base ml-1"
                title={uiMode === 'serious' ? 'Remove target' : 'Eject shard'}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Add Shard Form */}
        <form onSubmit={handleAddCert} className="flex gap-2">
          <input
            type="text"
            placeholder={
              uiMode === 'serious'
                ? 'Add target certification (e.g. AWS Solutions Architect, GCP Cloud Engineer, CKA)...'
                : 'Install target cert shard (e.g. AWS Solutions Architect, GCP Cloud Engineer, CKA)...'
            }
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            className="flex-1 bg-[#05060A] border-2 border-slate-700 px-3.5 py-2 text-xs font-hud text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
          />
          <button
            type="submit"
            className="px-4 py-2 cyber-btn-yellow text-xs font-black"
          >
            {uiMode === 'serious' ? '[+ ADD CERTIFICATION]' : '[+ INSTALL SHARD]'}
          </button>
        </form>
      </div>

      {/* 2. Building & Freelance Ideas Vault */}
      <div className="cyber-redone-container p-6 relative">
        {/* Top corner cyan hazard stripe */}
        <div className="absolute top-0 right-0 w-28 h-2.5 hazard-stripe-cyan" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="font-cyber text-sm font-black tracking-wider uppercase text-[#00F0FF]">
              {uiMode === 'serious'
                ? 'PROJECTS & FREELANCE CONTRACT VAULT'
                : 'CYBERWARE BLUEPRINTS & FREELANCE CONTRACT VAULT'}
            </h3>
          </div>
          <TechBadge mode={uiMode} type="dev" size="sm" />
        </div>

        {/* Add Idea Card */}
        <div className="p-4 bg-[#05060A] border border-slate-800 cyber-cut space-y-3 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              placeholder={
                uiMode === 'serious'
                  ? 'Project or Client Deliverable Title...'
                  : 'Blueprint / Project Title...'
              }
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 bg-[#0C0E18] border border-slate-700 px-3 py-2 text-xs font-hud text-slate-100 focus:outline-none focus:border-[#00F0FF] cyber-cut"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="bg-[#0C0E18] border border-slate-700 px-2 py-2 text-xs font-cyber text-[#00F0FF] focus:outline-none focus:border-[#00F0FF] cyber-cut"
            >
              <option value="side_project">{uiMode === 'serious' ? '[SIDE PROJECT]' : '[CYBER TOOL]'}</option>
              <option value="freelance">{uiMode === 'serious' ? '[FREELANCE CLIENT]' : '[FREELANCE CONTRACT]'}</option>
              <option value="certification">{uiMode === 'serious' ? '[CERT STUDY PROJECT]' : '[NET SHARD STUDY]'}</option>
            </select>
          </div>

          <textarea
            rows={2}
            placeholder={
              uiMode === 'serious'
                ? 'Concept or project deliverables (Gemini 3.8 Flash will auto-generate tech stack & sequential roadmap)...'
                : 'Concept or client deliverables (Gemini 3.8 Flash will auto-generate tech stack & sequential roadmap)...'
            }
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full bg-[#0C0E18] border border-slate-700 px-3 py-2 text-xs font-hud text-slate-200 focus:outline-none focus:border-[#00F0FF] cyber-cut"
          />

          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || isRefining}
              className="px-5 py-2 cyber-btn-cyan text-xs font-black flex items-center gap-2 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isRefining
                  ? 'ANALYZING VIA GEMINI 3.8...'
                  : uiMode === 'serious'
                  ? 'SAVE PROJECT & TECH STACK'
                  : 'COMMIT BLUEPRINT'}
              </span>
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-3.5">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-4 bg-[#0D0F1A] border-l-4 border-l-[#00F0FF] border border-slate-800 cyber-cut hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-cyber px-2.5 py-0.5 bg-[#00F0FF] text-black font-extrabold uppercase cyber-cut">
                      [{idea.category.replace('_', ' ')}]
                    </span>
                    <h4 className="font-hud text-base font-bold text-white tracking-wide">
                      {idea.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      playCyberClick();
                      onDeleteIdea(idea.id);
                    }}
                    className="text-slate-500 hover:text-[#FF003C] transition-colors p-1"
                    title="Delete blueprint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {idea.notes && (
                  <p className="font-tech text-xs text-slate-300 leading-relaxed mb-3">
                    {idea.notes}
                  </p>
                )}

                {/* Tech Stack Pills */}
                {idea.techStack && idea.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {idea.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 bg-[#05060A] border border-[#00F0FF]/40 text-[10px] font-cyber text-[#00F0FF] cyber-cut"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Roadmap Milestones */}
                {idea.roadmap && idea.roadmap.length > 0 && (
                  <div className="p-3 bg-[#05060A] border-t border-slate-800 space-y-1 font-tech text-xs text-slate-300">
                    <div className="text-[10px] font-cyber font-bold text-[#FCEE0A] uppercase tracking-wider mb-1">
                      EXECUTION ROADMAP:
                    </div>
                    {idea.roadmap.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
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
