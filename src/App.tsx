// CyberPulse: Autonomous Work & Study Ops Hub
// Night City Cyberpunk 2077 HUD Design
// Strictly Zero Yellow Emojis Enforced
// SECURED: Operator Privacy Gate protects real name & email from public visitors.
// Gemini 3.8 Flash routed securely through serverless backend (zero browser key exposure).

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
  fetchProfile,
  saveProfile,
  fetchReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  triggerReminderNow,
  sendTestEmailPing as apiSendTestEmail,
  fetchDaemonStatus,
  getProjectIdeas,
  saveProjectIdea,
  deleteProjectIdea,
  fetchEmailLogs,
} from './storage';
import { CyberCityBackdrop, WALLPAPERS } from './components/CyberCityBackdrop';
import { CyberCursor } from './components/CyberCursor';
import { CyberHeader, ActiveTab } from './components/CyberHeader';
import { CyberAuthGate } from './components/CyberAuthGate';
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

const GUEST_PROFILE: CyberProfile = {
  name: 'Guest Choombatta',
  email: 'guest@nightcity.io',
  activeRole: 'student',
  uiMode: 'serious',
  certTargets: ['AWS Cloud Practitioner', 'Docker Basics'],
  dailyCapacityHours: 8,
};

const GUEST_REMINDERS: ReminderItem[] = [
  {
    id: 'demo_1',
    title: 'Explore CyberPulse Workstation',
    theme: 'work',
    description: 'Check out the Night City Radio, switch wallpapers, test Serious vs Meme modes.',
    cadence: 'daily',
    time: '12:00',
    intervalDays: 1,
    weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    email: 'guest@nightcity.io',
    autoEmail: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    nextTriggerAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  },
];

export default function App() {
  const [authRole, setAuthRole] = useState<'operator' | 'guest' | null>(() => {
    return (sessionStorage.getItem('cyberpulse_auth_role') as any) || null;
  });

  const [profile, setProfile] = useState<CyberProfile>({
    name: 'Vyom',
    email: 'rajkesir74@gmail.com',
    activeRole: 'student_intern_freelancer',
    uiMode: 'serious',
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

  // Modal States
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
    if (authRole === 'guest') {
      setProfile(GUEST_PROFILE);
      setReminders(GUEST_REMINDERS);
      setDaemonStatus({
        online: true,
        daemonStartTime: new Date().toISOString(),
        uptimeSeconds: 3600,
        activeCount: 1,
        totalReminders: 1,
        serverTime: new Date().toISOString(),
      });
      setEmailLogs([]);
      setIdeas(getProjectIdeas());
      return;
    }

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
  }, [authRole]);

  useEffect(() => {
    if (authRole) {
      refreshAll();
      const interval = setInterval(() => {
        if (authRole === 'operator') {
          fetchDaemonStatus().then(setDaemonStatus);
          fetchEmailLogs().then(setEmailLogs);
        }
      }, 15_000);
      return () => clearInterval(interval);
    }
  }, [authRole, refreshAll]);

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
    if (authRole === 'operator') {
      await saveProfile(updated);
    }
  };

  // Reminders Actions
  const handleSaveReminder = async (data: Partial<ReminderItem>) => {
    const created = await createReminder(data);
    setReminders((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleToggleReminderStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    await updateReminder(id, { status: nextStatus as any });
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r))
    );
  };

  const handleDeleteReminder = async (id: string) => {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleTriggerNow = async (id: string) => {
    const ok = await triggerReminderNow(id);
    if (ok) {
      fetchEmailLogs().then(setEmailLogs);
    }
    return ok;
  };

  // Ideas Actions
  const handleAddIdea = (idea: ProjectIdea) => {
    saveProjectIdea(idea);
    setIdeas((prev) => [idea, ...prev]);
  };

  const handleDeleteIdea = (id: string) => {
    deleteProjectIdea(id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddCertTarget = async (cert: string) => {
    if (profile.certTargets.includes(cert)) return;
    const updated = { ...profile, certTargets: [...profile.certTargets, cert] };
    setProfile(updated);
    if (authRole === 'operator') await saveProfile(updated);
  };

  const handleRemoveCertTarget = async (cert: string) => {
    const updated = { ...profile, certTargets: profile.certTargets.filter((c) => c !== cert) };
    setProfile(updated);
    if (authRole === 'operator') await saveProfile(updated);
  };

  // Test Email Action
  const sendTestEmailPing = async (targetEmail: string) => {
    const ok = await apiSendTestEmail(targetEmail);
    if (ok) {
      fetchEmailLogs().then(setEmailLogs);
    }
    return ok;
  };

  const handleLockTerminal = () => {
    sessionStorage.removeItem('cyberpulse_auth_role');
    setAuthRole(null);
  };

  // If not authenticated, render the Privacy Shield & Login Gate
  if (!authRole) {
    return (
      <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-[#00F0FF] selection:text-black font-hud">
        <CyberCityBackdrop currentWallpaperId={wallpaperId} />
        <CyberCursor enabled={cursorMode} />
        <CyberAuthGate
          onUnlockOperator={() => {
            sessionStorage.setItem('cyberpulse_auth_role', 'operator');
            setAuthRole('operator');
          }}
          onEnterGuest={() => {
            sessionStorage.setItem('cyberpulse_auth_role', 'guest');
            setAuthRole('guest');
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-[#00F0FF] selection:text-black font-hud">
      {/* 1. Visible Night City Backdrop Wallpaper (Hardware-optimized) */}
      <CyberCityBackdrop currentWallpaperId={wallpaperId} />

      {/* 2. Custom Cyber Reticle Cursor (Zero-lag unified assembly) */}
      <CyberCursor enabled={cursorMode} />

      {/* 3. Top Cyberpunk Glass Navigation */}
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
        onLockTerminal={handleLockTerminal}
      />

      {/* 4. Main Command Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 relative z-10">
        
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
              if (authRole === 'operator') await saveProfile(p);
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
      />

      <ProfileAndBandwidthModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        bandwidthPercent={bandwidthPercent}
        activeRemindersCount={activeRemindersCount}
        onSaveProfile={async (p) => {
          setProfile(p);
          if (authRole === 'operator') await saveProfile(p);
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
