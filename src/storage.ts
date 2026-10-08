import { DailyLog, UserProfile, HabitItem } from './types';
import { DEFAULT_API_KEY } from './gemini';

const STORAGE_KEYS = {
  LOGS: 'daypulse_daily_logs',
  PROFILE: 'daypulse_user_profile',
  ROUTINES: 'daypulse_saved_routines',
  CHAT: 'daypulse_chat_messages',
};

export const DEFAULT_HABITS: HabitItem[] = [
  { id: 'sunlight', label: 'Morning sunlight', hint: '10–15 mins outside', iconName: 'Sun' },
  { id: 'hydrate', label: 'Hydrate well', hint: 'Water before caffeine', iconName: 'Droplet' },
  { id: 'movement', label: 'Gentle movement', hint: 'Walk, stretch, or workout', iconName: 'Activity' },
  { id: 'pause', label: 'Mindful pause', hint: '2 mins of conscious breathing', iconName: 'Wind' },
];

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitialLog(date: string = getTodayKey()): DailyLog {
  return {
    date,
    mood: 3, // Steady by default
    energy: 6, // Balanced
    intention: '',
    gratitude: '',
    reflection: '',
    completedHabits: [],
    updatedAt: Date.now(),
  };
}

export function getAllLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse logs from localStorage', e);
    return {};
  }
}

export function getTodayLog(): DailyLog {
  const logs = getAllLogs();
  const today = getTodayKey();
  return logs[today] || getInitialLog(today);
}

export function saveDailyLog(log: DailyLog): void {
  try {
    const logs = getAllLogs();
    logs[log.date] = { ...log, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save log', e);
  }
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.geminiApiKey) {
        parsed.geminiApiKey = DEFAULT_API_KEY;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to get user profile', e);
  }
  return {
    name: 'Friend',
    streakCount: 1,
    lastActiveDate: getTodayKey(),
    geminiApiKey: DEFAULT_API_KEY,
    isDarkMode: false,
  };
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function calculateStreak(): number {
  const logs = getAllLogs();
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);

  // Check if today is logged
  const todayKey = getTodayKey();
  if (logs[todayKey]) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is not logged yet, start checking from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    if (logs[key]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return Math.max(1, streak);
}

export function exportBackupJson(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    logs: getAllLogs(),
    profile: getUserProfile(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.logs) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(parsed.logs));
    }
    if (parsed.profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
    }
    return true;
  } catch (e) {
    console.error('Failed to import backup JSON', e);
    return false;
  }
}
