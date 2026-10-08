// CyberNav: Sleek glassmorphic tab selector
// STRICT RULE: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { Layers, Lightbulb, User, Server } from 'lucide-react';
import { UiMode } from '../types';

export type ActiveTab = 'reminders' | 'ideas' | 'profile' | 'daemon';

interface CyberNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  uiMode: UiMode;
  activeCount: number;
}

export function CyberNav({ currentTab, onSelectTab, uiMode, activeCount }: CyberNavProps) {
  const tabs = [
    {
      id: 'reminders' as const,
      label: uiMode === 'serious' ? 'DIRECTIVES MATRIX' : 'TASKS & MEMES',
      icon: Layers,
      badge: activeCount > 0 ? activeCount : null,
    },
    {
      id: 'ideas' as const,
      label: uiMode === 'serious' ? 'CERT & IDEA VAULT' : 'SIDE QUESTS',
      icon: Lightbulb,
      badge: null,
    },
    {
      id: 'profile' as const,
      label: uiMode === 'serious' ? 'BANDWIDTH HUD' : 'OPERATOR PROFILE',
      icon: User,
      badge: null,
    },
    {
      id: 'daemon' as const,
      label: '24/7 DAEMON',
      icon: Server,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#080D1A]/90 border-t border-cyan-500/25 px-4 py-2.5 shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-2xl mx-auto flex items-center justify-around gap-2 font-mono text-[11px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 tracking-wider uppercase text-[10px] truncate max-w-[85px] sm:max-w-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
