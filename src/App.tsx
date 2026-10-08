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
import { CyberRadioDock } from './components/CyberRadioDock';
import { DaemonView } from './components/DaemonView';
import { WorkloadView } from './components/WorkloadView';
import { AddReminderModal } from './components/AddReminderModal';
import { ProfileAndBandwidthModal } from './components/ProfileAndBandwidthModal';
import { DaemonOutboxModal } from './components/DaemonOutboxModal';
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
        {/* 1. Reminders & Schedule */}
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

        {/* 2. Certifications & Projects */}
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

        {/* 3. 24/7 Email Automation */}
        {activeTab === 'daemon' && (
          <DaemonView
            daemonStatus={daemonStatus}
            emailLogs={emailLogs}
            userEmail={profile.email}
            uiMode={profile.uiMode}
            onRefresh={refreshAll}
            onSendTestPing={sendTestEmailPing}
          />
        )}

        {/* 4. Workload & Profile */}
        {activeTab === 'profile' && (
          <WorkloadView
            profile={profile}
            bandwidthPercent={bandwidthPercent}
            activeRemindersCount={activeRemindersCount}
            uiMode={profile.uiMode}
            onSaveProfile={async (p) => {
              setProfile(p);
              await saveProfile(p);
            }}
            onSendTestPing={sendTestEmailPing}
          />
        )}

        {/* 5. Focus Radio (The Last Section) */}
        {activeTab === 'radio' && (
          <CyberRadio />
        )}

        {/* Persistent Cyberpunk Radio Player Bar (Docked across all sections) */}
        <CyberRadioDock
          onOpenRadioTab={() => setActiveTab('radio')}
          isRadioTabActive={activeTab === 'radio'}
        />

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
