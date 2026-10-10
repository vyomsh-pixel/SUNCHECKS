// ObsidianVaultModal: 2-Step Topic & Sub-Item Selector for Local Obsidian Vault (D:\vault\VYOM)
// Zero dependencies, lightweight regex Markdown parser optimized for 8GB RAM setups.
// STRICT: Zero yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState, useRef, useMemo } from 'react';
import { ReminderItem, ReminderCadence, ReminderTheme, UiMode } from '../types';
import {
  FolderOpen,
  FileText,
  CheckSquare,
  Square,
  X,
  Search,
  Layers,
  Send,
  RefreshCw,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert } from '../cyberAudio';
import { SECOND_BRAIN_VAULT_NOTES } from '../data/secondBrainVault';

export interface ObsidianSubItem {
  id: string;
  text: string;
  isTask: boolean;
  completed: boolean;
}

export interface ObsidianSection {
  heading: string;
  items: ObsidianSubItem[];
}

export interface ObsidianNote {
  id: string;
  title: string;
  topic: string; // Folder / Category name
  relativePath: string;
  suggestedTheme: ReminderTheme;
  sections: ObsidianSection[];
  rawSnippet: string;
}

interface ObsidianVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArmDirective: (reminder: Partial<ReminderItem>) => Promise<void>;
  defaultEmail: string;
  uiMode: UiMode;
}

const VAULT_STORAGE_KEY = 'cyberpulse_obsidian_vault_v3';

function stripWikilinks(str: string): string {
  return str
    .replace(/\[\[(?:[^|\]]+\\?\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function cleanText(str: string): string {
  return stripWikilinks(str)
    .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectTheme(topic: string, title: string, content: string): ReminderTheme {
  const t = topic.toLowerCase();
  const combined = `${topic} ${title} ${content}`.toLowerCase();
  if (
    t === 'studies' ||
    combined.includes('cert') ||
    combined.includes('sc-900') ||
    combined.includes('sc900') ||
    combined.includes('roadmap') ||
    combined.includes('checklist')
  ) {
    return 'cert';
  }
  if (
    combined.includes('freelance') ||
    combined.includes('pneumatic') ||
    combined.includes('financial') ||
    combined.includes('vedanta')
  ) {
    return 'freelance';
  }
  if (
    t === 'life' ||
    combined.includes('health') ||
    combined.includes('rhythm') ||
    combined.includes('audit')
  ) {
    return 'life';
  }
  return 'work';
}

function parseMarkdownFile(relativePath: string, rawContent: string, index: number): ObsidianNote {
  const normalized = relativePath.replace(/\\/g, '/');
  const rawParts = normalized.split('/');
  // Strip root container folder name (e.g. 'VYOM' or 'Second-Brain') if present
  const parts =
    rawParts.length >= 2 &&
    (rawParts[0].toLowerCase() === 'vyom' ||
      rawParts[0].toLowerCase() === 'second-brain' ||
      rawParts[0].toLowerCase() === 'vault')
      ? rawParts.slice(1)
      : rawParts;

  const topic = parts.length >= 2 ? parts[0] : 'General Notes';
  const rawFileName = (parts[parts.length - 1] || 'Untitled.md')
    .replace(/\.md$/i, '')
    .replace(/_/g, ' ');

  let title = rawFileName;
  if (parts.length >= 3) {
    const subFolder = parts[1].replace(/_/g, ' ');
    if (subFolder.toLowerCase() === rawFileName.toLowerCase()) {
      title = `${subFolder} // Master Note`;
    } else {
      title = `${subFolder} // ${rawFileName}`;
    }
  }
  title = cleanText(title);

  // Strip YAML frontmatter if present
  let content = rawContent;
  if (content.startsWith('---')) {
    const endFrontmatter = content.indexOf('\n---', 3);
    if (endFrontmatter !== -1) {
      content = content.slice(endFrontmatter + 4);
    }
  }

  const lines = content.split(/\r?\n/);
  const sections: ObsidianSection[] = [];
  let currentSection: ObsidianSection = {
    heading: 'Overview & Key Items',
    items: [],
  };

  let itemCounter = 0;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || !line || line === '---') continue;

    // Match Markdown headings (#, ##, ###, ####)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const hText = cleanText(headingMatch[2].replace(/#/g, ''));
      if (hText) {
        if (currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          heading: hText,
          items: [],
        };
      }
      continue;
    }

    if (currentSection.items.length >= 12) continue;

    // Match Markdown Table Rows
    if (line.startsWith('|') && line.endsWith('|')) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue;
      const nextLine = (lines[i + 1] || '').trim();
      if (/^\|[\s:|-]+\|$/.test(nextLine)) continue;

      const preCleaned = stripWikilinks(line);
      const cells = preCleaned
        .slice(1, -1)
        .split('|')
        .map((c) => cleanText(c))
        .filter(Boolean);
      if (cells.length > 0) {
        const rowText = cells.join(' :: ');
        if (rowText.length > 3) {
          currentSection.items.push({
            id: `obs_${index}_${itemCounter++}`,
            text: rowText.slice(0, 160),
            isTask: true,
            completed: false,
          });
        }
      }
      continue;
    }

    // Match Markdown checklists: - [ ] or - [x] or * [ ]
    const taskMatch = line.match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      const tText = cleanText(taskMatch[2]);
      if (tText) {
        currentSection.items.push({
          id: `obs_${index}_${itemCounter++}`,
          text: tText.slice(0, 160),
          isTask: true,
          completed: taskMatch[1].toLowerCase() === 'x',
        });
      }
      continue;
    }

    // Match bullet points or numbered lists: - item, * item, 1. item
    const bulletMatch = /^(?:[-*+]|\d+\.)\s+(.+)$/.exec(line);
    if (bulletMatch) {
      const cleanBullet = cleanText(bulletMatch[1]);
      if (cleanBullet.length > 2) {
        currentSection.items.push({
          id: `obs_${index}_${itemCounter++}`,
          text: cleanBullet.slice(0, 160),
          isTask: false,
          completed: false,
        });
      }
      continue;
    }
  }

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  // If file had no structured items at all, create a fallback item
  if (sections.length === 0) {
    sections.push({
      heading: title,
      items: [
        {
          id: `obs_${index}_fallback`,
          text: `Review & execute Second-Brain note: ${title}`,
          isTask: true,
          completed: false,
        },
      ],
    });
  }

  const rawSnippet = cleanText(content.replace(/[#*`>|_-]/g, ' ')).slice(0, 120);

  return {
    id: `note_${index}_${Date.now()}`,
    title,
    topic,
    relativePath,
    suggestedTheme: detectTheme(topic, title, content),
    sections,
    rawSnippet: rawSnippet || `Second-Brain note in ${topic}`,
  };
}

export function ObsidianVaultModal({
  isOpen,
  onClose,
  onArmDirective,
  defaultEmail,
  uiMode,
}: ObsidianVaultModalProps) {
  const [notes, setNotes] = useState<ObsidianNote[]>(() => {
    try {
      const saved = localStorage.getItem(VAULT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return SECOND_BRAIN_VAULT_NOTES;
  });

  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cadence, setCadence] = useState<ReminderCadence>('daily');
  const [time, setTime] = useState('10:00');
  const [isArming, setIsArming] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);

  const topics = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => set.add(n.topic));
    return ['ALL', ...Array.from(set)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesTopic = selectedTopic === 'ALL' || n.topic === selectedTopic;
      const matchesSearch =
        !searchQuery.trim() ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.sections.some((s) =>
          s.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.items.some((i) => i.text.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      return matchesTopic && matchesSearch;
    });
  }, [notes, selectedTopic, searchQuery]);

  const activeNote = useMemo(() => {
    return filteredNotes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || null;
  }, [filteredNotes, selectedNoteId]);

  if (!isOpen) return null;

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    playCyberClick();
    setSyncStatus('SCANNING VAULT MARKDOWN FILES...');

    const mdFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const rel = f.webkitRelativePath || f.name;
      // Ignore .obsidian, .git, .trash, node_modules
      if (
        rel.includes('.obsidian/') ||
        rel.includes('.obsidian\\') ||
        rel.includes('.trash/') ||
        rel.includes('.git/')
      ) {
        continue;
      }
      if (f.name.toLowerCase().endsWith('.md')) {
        mdFiles.push(f);
      }
    }

    if (mdFiles.length === 0) {
      setSyncStatus('NO .MD NOTES FOUND IN SELECTED FOLDER (ADD NOTES TO D:\\vault\\VYOM)');
      return;
    }

    const parsedNotes: ObsidianNote[] = [];
    for (let i = 0; i < mdFiles.length; i++) {
      try {
        const text = await mdFiles[i].text();
        const relPath = mdFiles[i].webkitRelativePath || mdFiles[i].name;
        parsedNotes.push(parseMarkdownFile(relPath, text, i));
      } catch {
        // skip unreadable file
      }
    }

    setNotes(parsedNotes);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(parsedNotes));
    setSelectedTopic('ALL');
    if (parsedNotes[0]) {
      setSelectedNoteId(parsedNotes[0].id);
    }
    setSelectedItemIds([]);
    playCyberAlert();
    setSyncStatus(`SYNCED ${parsedNotes.length} OBSIDIAN NOTES INTO NEURAL SHARD`);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const toggleItemSelection = (itemId: string) => {
    playCyberClick();
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const selectAllInSection = (section: ObsidianSection) => {
    playCyberClick();
    const ids = section.items.map((i) => i.id);
    const allSelected = ids.every((id) => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleArmSelected = async () => {
    if (!activeNote) return;
    playCyberAlert();
    setIsArming(true);

    // Gather selected items (or if none explicitly checked, take the first section's items)
    const allNoteItems = activeNote.sections.flatMap((s) =>
      s.items.map((item) => ({ ...item, sectionHeading: s.heading }))
    );

    const chosen =
      selectedItemIds.length > 0
        ? allNoteItems.filter((i) => selectedItemIds.includes(i.id))
        : allNoteItems.slice(0, 4);

    const primaryHeading = chosen[0]?.sectionHeading || activeNote.title;
    const directiveTitle =
      selectedItemIds.length === 1
        ? `[${activeNote.topic}] ${chosen[0].text.slice(0, 65)}`
        : `[${activeNote.title}] ${primaryHeading}`;

    const descriptionLines = [
      `OBSIDIAN VAULT DIRECTIVE // TOPIC: ${activeNote.topic.toUpperCase()}`,
      `SOURCE NOTE: ${activeNote.title}`,
      '',
      'SELECTED ACTION ITEMS:',
      ...chosen.map((c) => `• ${c.text}`),
    ];

    try {
      await onArmDirective({
        title: directiveTitle,
        theme: activeNote.suggestedTheme,
        description: descriptionLines.join('\n'),
        cadence,
        time,
        intervalDays: 1,
        weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        email: defaultEmail,
        autoEmail: true,
        status: 'active',
      });
      setSelectedItemIds([]);
      onClose();
    } finally {
      setIsArming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-[#070912] border-2 border-[#00F0FF] p-5 sm:p-6 shadow-[0_0_35px_rgba(0,240,255,0.25)] text-slate-100 max-h-[92vh] flex flex-col justify-between cyber-cut-card relative">
        
        {/* Top Hazard Stripe */}
        <div className="absolute top-0 right-0 w-40 h-2.5 hazard-stripe-cyan" />

        {/* Hidden Folder Input for D:\vault\VYOM */}
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is standard across Chromium/Brave/Firefox
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handleFolderSelect}
          className="hidden"
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <TechBadge mode={uiMode} type="terminal" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                <h2 className="text-base sm:text-lg font-cyber font-black tracking-wider text-[#00F0FF]">
                  SECOND-BRAIN // OBSIDIAN VAULT LINKER (D:\vault\VYOM)
                </h2>
              </div>
              <p className="text-xs font-tech text-slate-400 mt-0.5">
                {notes.length} Notes Indexed &bull; Step 1: Select Topic &amp; Note &rarr; Step 2: Select Sub-Items &rarr; Arm 24/7 Email Schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                folderInputRef.current?.click();
              }}
              className="px-3.5 py-2 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/25 cyber-cut text-xs font-cyber font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all"
              title="Re-sync D:\vault\VYOM after adding or editing notes in Obsidian"
            >
              <FolderOpen className="w-4 h-4" />
              <span>RE-SYNC D:\vault\VYOM</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-[#FF003C] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {syncStatus && (
          <div className="mt-3 p-2.5 bg-[#00FF66]/10 border border-[#00FF66] text-[#00FF66] text-xs font-tech cyber-cut flex items-center justify-between">
            <span>{syncStatus}</span>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          </div>
        )}

        {/* Step 1: Topic Filter Bar & Search */}
        <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[10px] font-cyber text-slate-400 uppercase mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#FCEE0A]" />
              TOPICS:
            </span>
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  playCyberClick();
                  setSelectedTopic(topic);
                }}
                className={`px-3 py-1 text-xs font-hud uppercase tracking-wider cyber-cut transition-all whitespace-nowrap ${
                  selectedTopic === topic
                    ? 'bg-[#FCEE0A] text-black font-black shadow-[0_0_10px_rgba(252,238,10,0.4)]'
                    : 'bg-[#0B0E18] text-slate-300 border border-slate-800 hover:border-[#00F0FF]/50'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or sub-items..."
              className="w-full bg-[#05060B] border border-slate-700 pl-8 pr-3 py-1.5 text-xs font-hud text-slate-100 focus:outline-none focus:border-[#00F0FF] cyber-cut"
            />
          </div>
        </div>

        {/* Main 2-Column Split Explorer */}
        <div className="my-4 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto max-h-[50vh] pr-1">
          
          {/* Left Column: Notes inside Selected Topic */}
          <div className="md:col-span-4 space-y-2 overflow-y-auto pr-1">
            <div className="text-[10px] font-cyber text-[#00F0FF] uppercase tracking-wider mb-1">
              1. SELECT NOTE ({filteredNotes.length})
            </div>
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              const totalItems = note.sections.reduce((acc, s) => acc + s.items.length, 0);
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    playCyberClick();
                    setSelectedNoteId(note.id);
                    setSelectedItemIds([]);
                  }}
                  className={`p-3 cursor-pointer border transition-all cyber-cut ${
                    isSelected
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'bg-[#05070E] border-slate-800/90 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                      <span className="font-cyber text-xs font-bold leading-snug">{note.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FCEE0A]' : 'text-slate-600'}`} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-tech text-slate-400">
                    <span className="text-[#FCEE0A]">[{note.topic}]</span>
                    <span>{totalItems} sub-items</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Inside the Note (Sections & Actionable Contents) */}
          <div className="md:col-span-8 bg-[#05060B] border border-slate-800 p-4 cyber-cut overflow-y-auto space-y-4">
            {activeNote ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-cyber text-[#FCEE0A] uppercase">
                      2. SELECT WHAT IT CONTAINS // {activeNote.topic}
                    </span>
                    <h3 className="font-cyber text-sm font-black text-white mt-0.5">
                      {activeNote.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-tech text-[#00FF66]">
                    {selectedItemIds.length} item(s) selected
                  </span>
                </div>

                <div className="space-y-4">
                  {activeNote.sections.map((section, sIdx) => {
                    const allSectionSelected =
                      section.items.length > 0 &&
                      section.items.every((i) => selectedItemIds.includes(i.id));

                    return (
                      <div key={sIdx} className="border border-slate-800/90 bg-[#080B14] p-3.5 cyber-cut space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="font-cyber text-xs font-bold text-[#00F0FF]">
                            # {section.heading}
                          </span>
                          <button
                            type="button"
                            onClick={() => selectAllInSection(section)}
                            className="px-2 py-0.5 text-[10px] font-tech border border-slate-700 hover:border-[#FCEE0A] text-slate-300 hover:text-[#FCEE0A] cyber-cut transition-colors"
                          >
                            {allSectionSelected ? 'DESELECT SECTION' : 'SELECT ALL IN SECTION'}
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {section.items.map((item) => {
                            const isChecked = selectedItemIds.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                onClick={() => toggleItemSelection(item.id)}
                                className={`p-2 rounded-none cursor-pointer flex items-start gap-2.5 text-xs font-hud transition-all border ${
                                  isChecked
                                    ? 'bg-[#00FF66]/10 border-[#00FF66]/60 text-white'
                                    : 'bg-[#05060A]/60 border-transparent hover:border-slate-700 text-slate-300'
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-[#00FF66] shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                )}
                                <span className="leading-relaxed">{item.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-500 font-tech text-xs">
                Select a topic note on the left to inspect its sections and tasks.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Schedule Cadence & 1-Click Arm Directive */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-hud">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-cyber text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FCEE0A]" />
              CADENCE:
            </span>
            {(['daily', 'weekdays', 'interval', 'random'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  playCyberClick();
                  setCadence(c);
                }}
                className={`px-2.5 py-1 uppercase text-[11px] font-bold cyber-cut border ${
                  cadence === c
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                    : 'bg-[#090C15] text-slate-300 border-slate-700'
                }`}
              >
                {c}
              </button>
            ))}

            {cadence !== 'random' && (
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-[#090C15] border border-slate-700 px-2.5 py-1 text-xs text-[#FCEE0A] font-mono cyber-cut"
              />
            )}
          </div>

          <button
            type="button"
            disabled={!activeNote || isArming}
            onClick={handleArmSelected}
            className="px-6 py-2.5 cyber-btn-yellow text-xs font-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(252,238,10,0.4)] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isArming
                ? 'ARMING DIRECTIVE...'
                : selectedItemIds.length > 0
                ? `ARM ${selectedItemIds.length} SELECTED INTO 24/7 SCHEDULE`
                : 'ARM TOPIC INTO 24/7 SCHEDULE'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
