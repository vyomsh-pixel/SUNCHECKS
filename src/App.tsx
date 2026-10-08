// CyberPulse 2077: Autonomous Night City Work & Study Ops Terminal
// Inspired by authentic Cyberpunk 2077 UI & cyberpunk2077.webflow.io
// STRICT RULES:
// 1. Zero yellow emojis anywhere.
// 2. Strict Gemini 3.8 Flash.
// 3. 24/7 Autonomous background scheduler & multi-cadence auto-emailing via Resend.
// 4. Cyberpunk 2077 chamfers, hazard stripes, reticle cursor, audio synthesizer.

import { useState, useEffect, useCallback } from 'react';
import {
  ReminderItem,
  CyberProfile,
  ProjectIdea,
  DaemonStatus,
  EmailLogItem,
  UiMode,
} from './types';
import {
  fetchDaemonStatus,
  fetchReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  triggerReminderNow,
  sendTestEmailPing,
  fetchProfile,
  saveProfile,
  getProjectIdeas,
  saveProjectIdea,
  deleteProjectIdea,
  fetchEmailLogs,
} from './storage';
import { CyberCityBackdrop, WALLPAPERS } from './components/CyberCityBackdrop';
import { CyberCursor } from './components/CyberCursor';
import { CyberHeader, ActiveTab } from './components/CyberHeader';
import { ReminderMatrix } from './components/ReminderMatrix';
import { IdeasAndCertVault } from './components/IdeasAndCertVault';
import { CyberRadio } from './components/CyberRadio';
import { AddReminderModal } from './components/AddReminderModal';
import { ProfileAndBandwidthModal } from './components/ProfileAndBandwidthModal';
import { DaemonOutboxModal } from './components/DaemonOutboxModal';
import { TechBadge } from './components/TechBadge';
import { playCyberClick } from './cyberAudio';

export default function App() {
  const [profile, setProfile] = useState<CyberProfile>({
    name: 'Vyom',
    email: 'rajkesir74@gmail.com',
    activeRole: 'student_intern_freelancer',
    uiMode: 'serious',
    geminiApiKey: '',
    certTargets: ['AWS Solutions Architect', 'GCP Associate Cloud Engineer', 'CKA Kubernetes'],
    dailyCapacityHours: 14,
  });

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [daemonStatus, setDaemonStatus] = useState<DaemonStatus>({
    online: false,
    daemonStartTime: '',
    uptimeSeconds: 0,
    activeCount: 0,
    totalReminders: 0,
    serverTime: '',
  });
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('reminders');
  const [wallpaperId, setWallpaperId] = useState<string>(() => {
    return localStorage.getItem('cyber_wallpaper_id') || 'cyberpunk_redone_dark';
  });
  const [cursorMode, setCursorMode] = useState<boolean>(() => {
    return localStorage.getItem('cyber_cursor_enabled') === 'true';
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOutboxModalOpen, setIsOutboxModalOpen] = useState(false);

  const handleCycleWallpaper = () => {
    playCyberClick();
    const currentIndex = WALLPAPERS.findIndex((w) => w.id === wallpaperId);
    const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
    const nextWallpaper = WALLPAPERS[nextIndex];
    setWallpaperId(nextWallpaper.id);
    localStorage.setItem('cyber_wallpaper_id', nextWallpaper.id);
  };

  const handleToggleCursor = () => {
    playCyberClick();
    setCursorMode((prev) => {
      const next = !prev;
      localStorage.setItem('cyber_cursor_enabled', String(next));
      return next;
    });
  };

  // Sync initial data from backend daemon and local cache
  const refreshAll = useCallback(async () => {
    const [p, r, d, l] = await Promise.all([
      fetchProfile(),
      fetchReminders(),
      fetchDaemonStatus(),
      fetchEmailLogs(),
    ]);
    setProfile(p);
    setReminders(r);
    setDaemonStatus(d);
    setEmailLogs(l);
    setIdeas(getProjectIdeas());
  }, []);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchDaemonStatus().then(setDaemonStatus);
      fetchEmailLogs().then(setEmailLogs);
    }, 15_000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Life Bandwidth Calculation (% capacity)
  const activeRemindersCount = reminders.filter((r) => r.status === 'active').length;
  const bandwidthPercent = Math.min(
    100,
    Math.round(((activeRemindersCount * 1.5) / (profile.dailyCapacityHours || 14)) * 100)
  );

  // Toggle Serious vs Fun / Meme Mode
  const handleToggleMode = async () => {
    const nextMode: UiMode = profile.uiMode === 'serious' ? 'fun' : 'serious';
    const updated = { ...profile, uiMode: nextMode };
    setProfile(updated);
    await saveProfile(updated);
  };

  // Reminders Actions
  const handleSaveReminder = async (data: Partial<ReminderItem>) => {
    const created = await createReminder(data);
    setReminders((prev) => [created, ...prev]);
    fetchDaemonStatus().then(setDaemonStatus);
  };

  const handleToggleReminderStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    await updateReminder(id, { status: nextStatus as any });
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r))
    );
    fetchDaemonStatus().then(setDaemonStatus);
  };

  const handleDeleteReminder = async (id: string) => {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    fetchDaemonStatus().then(setDaemonStatus);
  };

  const handleTriggerNow = async (id: string) => {
    await triggerReminderNow(id, profile.email);
    const logs = await fetchEmailLogs();
    setEmailLogs(logs);
    fetchDaemonStatus().then(setDaemonStatus);
  };

  // Cert Targets Actions
  const handleAddCertTarget = async (cert: string) => {
    if (profile.certTargets.includes(cert)) return;
    const updated = { ...profile, certTargets: [...profile.certTargets, cert] };
    setProfile(updated);
    await saveProfile(updated);
  };

  const handleRemoveCertTarget = async (cert: string) => {
    const updated = {
      ...profile,
      certTargets: profile.certTargets.filter((c) => c !== cert),
    };
    setProfile(updated);
    await saveProfile(updated);
  };

  // Ideas Actions
  const handleAddIdea = (idea: ProjectIdea) => {
    saveProjectIdea(idea);
    setIdeas(getProjectIdeas());
  };

  const handleDeleteIdea = (id: string) => {
    deleteProjectIdea(id);
    setIdeas(getProjectIdeas());
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-hud relative selection:bg-[#FCEE0A] selection:text-black">
      
      {/* 1. Viewport Edge Cyber Lines (Like cyberpunk2077.webflow.io) */}
      <div className="cyber-frame-line-top" />
      <div className="cyber-frame-line-bottom" />

      {/* 2. Custom Interactive Reticle Cursor */}
      <CyberCursor enabled={cursorMode} />

      {/* 3. Live High-Res Cyberpunk Night City Backdrop (Visible) */}
      <CyberCityBackdrop currentWallpaperId={wallpaperId} />

      {/* 4. Top Cockpit HUD Header (cyberpunkredone.webflow.io style) */}
      <CyberHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeRemindersCount={activeRemindersCount}
        profile={profile}
        daemonStatus={daemonStatus}
        uiMode={profile.uiMode}
        currentWallpaperId={wallpaperId}
        onCycleWallpaper={handleCycleWallpaper}
        cursorMode={cursorMode}
        onToggleCursor={handleToggleCursor}
        onToggleMode={handleToggleMode}
        onOpenOutbox={() => setIsOutboxModalOpen(true)}
      />

      {/* 5. Main Operational Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6 pb-12 relative z-10">
        
        {/* Navigation Tab Content */}
        {activeTab === 'reminders' && (
          <ReminderMatrix
            reminders={reminders}
            uiMode={profile.uiMode}
            onAddClick={() => setIsAddModalOpen(true)}
            onToggleStatus={handleToggleReminderStatus}
            onDelete={handleDeleteReminder}
            onTriggerNow={handleTriggerNow}
          />
        )}

        {activeTab === 'radio' && (
          <CyberRadio />
        )}

        {activeTab === 'ideas' && (
          <IdeasAndCertVault
            ideas={ideas}
            uiMode={profile.uiMode}
            apiKey={profile.geminiApiKey}
            certTargets={profile.certTargets}
            onAddIdea={handleAddIdea}
            onDeleteIdea={handleDeleteIdea}
            onAddCertTarget={handleAddCertTarget}
            onRemoveCertTarget={handleRemoveCertTarget}
          />
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="cyber-redone-container p-6 relative">
              {/* Top corner hazard stripe */}
              <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <TechBadge mode={profile.uiMode} type="dev" size="lg" />
                  <div>
                    <h2 className="font-cyber text-lg font-black tracking-wider text-[#FCEE0A]">
                      OPERATOR IDENTITY: {profile.name.toUpperCase()}
                    </h2>
                    <p className="text-xs font-tech text-slate-300">
                      ACTIVE ROLE: {profile.activeRole.toUpperCase().replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playCyberClick();
                    setIsProfileModalOpen(true);
                  }}
                  className="px-4 py-2 cyber-btn-yellow text-xs font-black"
                >
                  [CONFIGURE OPERATOR]
                </button>
              </div>

              {/* Bandwidth Gauge Box */}
              <div className="p-4 bg-[#05060A]/80 border-2 border-[#00F0FF]/50 cyber-cut space-y-3">
                <div className="flex justify-between items-center text-xs font-cyber">
                  <span className="text-slate-300">DAILY LIFE BANDWIDTH CONSUMPTION</span>
                  <span className="text-[#FCEE0A] font-black text-sm">{bandwidthPercent}%</span>
                </div>
                <div className="w-full h-3 bg-[#0D0F18] border border-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      bandwidthPercent > 80
                        ? 'bg-gradient-to-r from-[#FCEE0A] to-[#FF003C]'
                        : 'bg-gradient-to-r from-[#00F0FF] to-[#00FF66]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, bandwidthPercent))}%` }}
                  />
                </div>
                <p className="text-xs font-tech text-slate-400 leading-relaxed pt-1">
                  Operating against your {profile.dailyCapacityHours}h daily bandwidth ceiling.
                  {bandwidthPercent > 80
                    ? ' Heavy velocity: balanced across student exams, intern tickets, and freelance deliverables.'
                    : ' Bandwidth balanced. Sufficient cognitive capacity for additional cloud certification modules.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daemon' && (
          <div className="space-y-6">
            <div className="cyber-redone-container p-6 relative">
              {/* Top corner cyan hazard stripe */}
              <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe-cyan" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <TechBadge mode={profile.uiMode} type="bot" size="lg" />
                  <div>
                    <h2 className="font-cyber text-lg font-black tracking-wider text-[#00F0FF]">
                      24/7 AUTONOMOUS NEURAL DAEMON
                    </h2>
                    <p className="text-xs font-tech text-slate-400">
                      Minute-by-minute heartbeat engine executing continuously via Node.js
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playCyberClick();
                    setIsOutboxModalOpen(true);
                  }}
                  className="px-4 py-2 cyber-btn-cyan text-xs font-black"
                >
                  [INSPECT OUTBOX]
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-[#05060A]/80 border-2 border-slate-800 cyber-cut">
                  <span className="text-[10px] font-cyber uppercase text-slate-400">STATUS</span>
                  <p className="text-xs font-cyber font-black text-[#00FF66] mt-1">
                    {daemonStatus.online ? 'ONLINE 24/7 // HEARTBEAT' : 'OFFLINE (LOCAL CACHE)'}
                  </p>
                </div>
                <div className="p-4 bg-[#05060A]/80 border-2 border-slate-800 cyber-cut">
                  <span className="text-[10px] font-cyber uppercase text-slate-400">ARMED REMINDERS</span>
                  <p className="text-xs font-cyber font-black text-[#FCEE0A] mt-1">
                    {daemonStatus.activeCount} ACTIVE SCHEDULES
                  </p>
                </div>
                <div className="p-4 bg-[#05060A]/80 border-2 border-slate-800 cyber-cut">
                  <span className="text-[10px] font-cyber uppercase text-slate-400">OUTBOX DISPATCHES</span>
                  <p className="text-xs font-cyber font-black text-white mt-1">
                    {emailLogs.length} LOGGED TRANSMISSIONS
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Technical Barcode & Disclaimer */}
        <div className="mt-10 pt-4 pb-2 border-t border-slate-800/80 flex flex-col items-center justify-center gap-2">
          <div className="font-tech text-xs tracking-widest text-[#FCEE0A]/60">
            ||| | |||| | || | 2077 // NIGHT CITY // 34.0522° N, 118.2437° W | |||| || | |||
          </div>
          <p className="text-[11px] font-tech text-slate-500 text-center max-w-xl">
            CYBERPULSE // Autonomous work &amp; study ops hub. Running 24/7 in background. Strictly for self-tracking, task cadence, and certification milestones.
          </p>
        </div>

      </main>

      {/* 7. Cyberpunk Modals */}
      <AddReminderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveReminder}
        defaultEmail={profile.email}
        uiMode={profile.uiMode}
        apiKey={profile.geminiApiKey}
      />

      <ProfileAndBandwidthModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        bandwidthPercent={bandwidthPercent}
        activeRemindersCount={activeRemindersCount}
        onSaveProfile={async (p) => {
          setProfile(p);
          await saveProfile(p);
        }}
        onSendTestPing={sendTestEmailPing}
      />

      <DaemonOutboxModal
        isOpen={isOutboxModalOpen}
        onClose={() => setIsOutboxModalOpen(false)}
        daemonStatus={daemonStatus}
        emailLogs={emailLogs}
        userEmail={profile.email}
        uiMode={profile.uiMode}
        onTriggerTestEmail={sendTestEmailPing}
      />

    </div>
  );
}
