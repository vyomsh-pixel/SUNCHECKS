// CyberPulse Data & API Sync Layer
// Seamless communication between Frontend HUD and 24/7 Backend Daemon

import { ReminderItem, CyberProfile, ProjectIdea, DaemonStatus, EmailLogItem } from './types';

const STORAGE_KEYS = {
  REMINDERS_CACHE: 'cyberpulse_reminders_cache',
  PROFILE_CACHE: 'cyberpulse_profile_cache',
  IDEAS: 'cyberpulse_project_ideas',
};

const DEFAULT_PROFILE: CyberProfile = {
  name: 'Vyom',
  email: 'rajkesir74@gmail.com',
  activeRole: 'student_intern_freelancer',
  uiMode: 'serious',
  certTargets: ['AWS Certified Solutions Architect', 'GCP Cloud Engineer', 'CKA Kubernetes'],
  dailyCapacityHours: 12,
};

const DEFAULT_IDEAS: ProjectIdea[] = [
  {
    id: 'idea_1',
    title: 'CyberPulse 24/7 Autonomous Daemon',
    category: 'side_project',
    notes: 'Zero-downtime personal ops hub running node-cron and multi-cadence email dispatcher.',
    status: 'in_progress',
    techStack: ['Node.js', 'Express', 'React', 'Tailwind CSS', 'Vite'],
    roadmap: ['Build cron scheduler', 'Implement glassmorphic HUD', 'Deploy to Render 24/7'],
    valueProposition: 'Automates all student/intern follow-ups without keeping browser open.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'idea_2',
    title: 'Cloud Cert Flashcard Simulator',
    category: 'certification',
    notes: 'Spaced repetition flashcards focusing on VPC peering and IAM least-privilege policies.',
    status: 'backlog',
    techStack: ['TypeScript', 'Gemini 3.8 Flash'],
    roadmap: ['Scrape exam blueprint', 'Generate scenario quizzes', 'Score tracking'],
    valueProposition: 'Speeds up AWS/GCP certification preparation by 3x.',
    createdAt: new Date().toISOString(),
  },
];

// 1. Daemon Status
export async function fetchDaemonStatus(): Promise<DaemonStatus> {
  try {
    const res = await fetch('/api/status', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Daemon offline or unreachable
  }
  return {
    online: false,
    daemonStartTime: '',
    uptimeSeconds: 0,
    activeCount: 0,
    totalReminders: 0,
    serverTime: new Date().toISOString(),
  };
}

// 2. Reminders CRUD
export async function fetchReminders(): Promise<ReminderItem[]> {
  try {
    const res = await fetch('/api/reminders', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEYS.REMINDERS_CACHE, JSON.stringify(data));
      return data;
    }
  } catch {
    console.warn('Backend daemon unreachable. Using local cache.');
  }

  // Fallback to local cache
  const cached = localStorage.getItem(STORAGE_KEYS.REMINDERS_CACHE);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return [];
}

export async function createReminder(data: Partial<ReminderItem>): Promise<ReminderItem> {
  try {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to post to backend, creating locally', err);
  }

  // Local fallback
  const current = await fetchReminders();
  const newItem: ReminderItem = {
    id: `rem_${Date.now()}`,
    title: data.title || 'Untitled Directive',
    theme: data.theme || 'work',
    description: data.description || '',
    cadence: data.cadence || 'daily',
    time: data.time || '10:00',
    intervalDays: data.intervalDays || 1,
    weekdays: data.weekdays || ['mon', 'wed', 'fri'],
    email: data.email || DEFAULT_PROFILE.email,
    autoEmail: data.autoEmail !== false,
    status: 'active',
    mode: data.mode || 'serious',
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    nextTriggerAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };
  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEYS.REMINDERS_CACHE, JSON.stringify(updated));
  return newItem;
}

export async function updateReminder(id: string, updates: Partial<ReminderItem>): Promise<ReminderItem | null> {
  try {
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to update on backend, updating locally', err);
  }

  const current = await fetchReminders();
  const idx = current.findIndex((r) => r.id === id);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.REMINDERS_CACHE, JSON.stringify(current));
    return current[idx];
  }
  return null;
}

export async function deleteReminder(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Failed to delete on backend', err);
  }

  const current = await fetchReminders();
  const filtered = current.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REMINDERS_CACHE, JSON.stringify(filtered));
  return true;
}

export interface TriggerResult {
  success: boolean;
  messageId?: string;
  recipient?: string;
  error?: string;
}

export async function triggerReminderNow(id: string, email?: string): Promise<TriggerResult> {
  try {
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success !== false) {
      return {
        success: true,
        messageId: data.messageId || data.data?.id,
        recipient: data.recipient,
      };
    }
    return {
      success: false,
      error: data.error || `HTTP ${res.status}: Delivery rejected`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with serverless engine',
    };
  }
}

export async function triggerCronScan(): Promise<{
  success: boolean;
  dispatchedCount: number;
  checkedAt?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/cron');
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        success: true,
        dispatchedCount: data.dispatchedCount || 0,
        checkedAt: data.checkedAt,
      };
    }
    return {
      success: false,
      dispatchedCount: 0,
      error: data.error || data.warning || 'Scheduler cycle check failed',
    };
  } catch (err: any) {
    return {
      success: false,
      dispatchedCount: 0,
      error: err.message || 'Network error executing scheduler cycle',
    };
  }
}

export async function sendTestEmailPing(email: string): Promise<boolean> {
  try {
    const res = await fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 3. Profile
export async function fetchProfile(): Promise<CyberProfile> {
  try {
    const res = await fetch('/api/profile', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEYS.PROFILE_CACHE, JSON.stringify(data));
      return data;
    }
  } catch {
    // fallback
  }

  const cached = localStorage.getItem(STORAGE_KEYS.PROFILE_CACHE);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return DEFAULT_PROFILE;
}

export async function saveProfile(profile: CyberProfile): Promise<CyberProfile> {
  localStorage.setItem(STORAGE_KEYS.PROFILE_CACHE, JSON.stringify(profile));
  try {
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  } catch {
    // ignore
  }
  return profile;
}

// 4. Project Ideas Vault
export function getProjectIdeas(): ProjectIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return raw ? JSON.parse(raw) : DEFAULT_IDEAS;
  } catch {
    return DEFAULT_IDEAS;
  }
}

export function saveProjectIdea(idea: ProjectIdea): void {
  const current = getProjectIdeas();
  const existingIndex = current.findIndex((i) => i.id === idea.id);
  if (existingIndex >= 0) {
    current[existingIndex] = idea;
  } else {
    current.unshift(idea);
  }
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(current));
}

export function deleteProjectIdea(id: string): void {
  const current = getProjectIdeas();
  const filtered = current.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(filtered));
}

// 5. Email Logs
export async function fetchEmailLogs(): Promise<EmailLogItem[]> {
  try {
    const res = await fetch('/api/logs');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return [];
}
