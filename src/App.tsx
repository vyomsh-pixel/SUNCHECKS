// CyberPulse: 24/7 Autonomous Work & Study Ops Terminal
// STRICT RULES:
// 1. Zero yellow emojis anywhere. Lucide vector stroke icons and text badges only.
// 2. Strict Gemini 3.8 Flash (no 2.5).
// 3. 24/7 Autonomous background scheduler & multi-cadence auto-emailing.
// 4. Live Cyberpunk Night City backdrop & obsidian glass UI.

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
import { CyberCityBackdrop } from './components/CyberCityBackdrop';
import { CyberHeader } from './components/CyberHeader';
import { CyberNav, ActiveTab } from './components/CyberNav';
import { ReminderMatrix } from './components/ReminderMatrix';
import { IdeasAndCertVault } from './components/IdeasAndCertVault';
import { AddReminderModal } from './components/AddReminderModal';
import { ProfileAndBandwidthModal } from './components/ProfileAndBandwidthModal';
import { DaemonOutboxModal } from './components/DaemonOutboxModal';
import { TechBadge } from './components/TechBadge';

export default function App() {
  const [profile, setProfile] = useState<CyberProfile>({
    name: 'Vyom',
    email: 'vyomsharma@example.com',
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOutboxModalOpen, setIsOutboxModalOpen] = useState(false);

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
    }, 20_000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Life Bandwidth Calculation (% capacity)
  const activeRemindersCount = reminders.filter((r) => r.status === 'active').length;
  const bandwidthPercent = Math.min(
    100,
    Math.round(((activeRemindersCount * 1.5) / (profile.dailyCapacityHours || 12)) * 100)
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
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Live Looping Cyberpunk Night City Wallpaper */}
      <CyberCityBackdrop />

      {/* 2. Top Glass HUD Header */}
      <CyberHeader
        profile={profile}
        daemonStatus={daemonStatus}
        uiMode={profile.uiMode}
        bandwidthPercent={bandwidthPercent}
        onToggleMode={handleToggleMode}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        onOpenOutbox={() => setIsOutboxModalOpen(true)}
      />

      {/* 3. Main Operational Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-6 pb-28 relative z-10">
        
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
            <div className="p-6 rounded-2xl bg-[#0B1020]/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TechBadge mode={profile.uiMode} type="dev" size="lg" />
                  <div>
                    <h2 className="text-base font-bold font-mono tracking-wider text-cyan-300">
                      OPERATOR IDENTITY: {profile.name.toUpperCase()}
                    </h2>
                    <p className="text-xs text-slate-300 font-mono">
                      ACTIVE PERSONA: {profile.activeRole.toUpperCase().replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold transition-all"
                >
                  [EDIT CONFIG]
                </button>
              </div>

              {/* Bandwidth Gauge Box */}
              <div className="p-4 rounded-xl bg-[#060A14] border border-cyan-500/20 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">DAILY CAPACITY CONSUMPTION</span>
                  <span className="text-cyan-300 font-bold">{bandwidthPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      bandwidthPercent > 80
                        ? 'bg-gradient-to-r from-amber-500 to-pink-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, bandwidthPercent))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed pt-1">
                  Calculated against your {profile.dailyCapacityHours}h daily bandwidth ceiling.
                  {bandwidthPercent > 80
                    ? ' High workload velocity across student exams, intern tickets, and freelance tasks.'
                    : ' Bandwidth balanced. Capacity available for additional certification modules.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daemon' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0B1020]/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TechBadge mode={profile.uiMode} type="bot" size="lg" />
                  <div>
                    <h2 className="text-base font-bold font-mono tracking-wider text-cyan-300">
                      24/7 AUTONOMOUS BACKGROUND ENGINE
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Continuous minute-by-minute heartbeat daemon running on Node.js
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOutboxModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold transition-all"
                >
                  [OPEN OUTBOX]
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#060A14] border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400">STATUS</span>
                  <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                    {daemonStatus.online ? 'ONLINE 24/7' : 'OFFLINE (LOCAL CACHE)'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060A14] border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400">ARMED REMINDERS</span>
                  <p className="text-xs font-mono font-bold text-cyan-300 mt-1">
                    {daemonStatus.activeCount} ACTIVE SCHEDULES
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060A14] border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400">OUTBOX DISPATCHES</span>
                  <p className="text-xs font-mono font-bold text-slate-100 mt-1">
                    {emailLogs.length} LOGGED TRANSMISSIONS
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Disclaimer (No medical claims, strictly personal work reminder ops) */}
        <div className="mt-8 pt-4 pb-2 text-center border-t border-slate-800/80">
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed max-w-lg mx-auto">
            CYBERPULSE // Autonomous work &amp; study reminder ops hub. Running 24/7 in background. Strictly for self-tracking, task cadence, and certification milestones.
          </p>
        </div>

      </main>

      {/* 4. Bottom Tab Bar Navigation */}
      <CyberNav
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        uiMode={profile.uiMode}
        activeCount={activeRemindersCount}
      />

      {/* Modals */}
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
