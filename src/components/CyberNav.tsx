// CyberNav: Cyberpunk 2077 HUD Tab Selector
// Features skewed angular tabs, neon yellow highlights, and audio click feedback.
// STRICT: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { Layers, Lightbulb, User, Server } from 'lucide-react';
import { UiMode } from '../types';
import { playCyberClick } from '../cyberAudio';

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
      label: uiMode === 'serious' ? 'GIGS MATRIX' : 'TASKS & MEMES',
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

  const handleTabClick = (tabId: ActiveTab) => {
    playCyberClick();
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080D]/95 border-t-2 border-[#FCEE0A] px-4 py-2 shadow-[0_-4px_30px_rgba(252,238,10,0.15)]">
      {/* Bottom hazard stripe accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 hazard-stripe opacity-80" />

      <div className="max-w-2xl mx-auto flex items-center justify-around gap-2 font-cyber text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 px-2 transition-all relative cyber-skew-tab ${
                isActive
                  ? 'bg-[#FCEE0A] text-black font-black shadow-[0_0_20px_rgba(252,238,10,0.6)]'
                  : 'bg-[#0E101A] text-slate-400 hover:text-[#00F0FF] hover:bg-[#151828]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.5]' : 'text-slate-400'}`} />
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-3 px-1 py-0.2 rounded text-[9px] font-black tracking-tighter ${
                      isActive ? 'bg-black text-[#FCEE0A]' : 'bg-[#FF003C] text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 tracking-wider uppercase text-[10px] truncate max-w-[90px] sm:max-w-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
