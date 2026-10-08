// CyberPulse Type Definitions
// Strict Zero Emojis Policy

export type ReminderCadence = 'daily' | 'interval' | 'weekdays' | 'random';
export type ReminderTheme = 'work' | 'cert' | 'freelance' | 'life';
export type UiMode = 'serious' | 'fun';
export type PersonaType = 'student_intern_freelancer' | 'student' | 'intern' | 'freelancer' | 'vacation_builder';

export interface ReminderItem {
  id: string;
  title: string;
  theme: ReminderTheme;
  description: string;
  cadence: ReminderCadence;
  time: string; // HH:MM
  intervalDays?: number;
  weekdays?: string[]; // ['mon', 'wed', 'fri']
  email: string;
  autoEmail: boolean;
  status: 'active' | 'paused' | 'completed';
  mode?: UiMode;
  createdAt: string;
  lastTriggeredAt: string | null;
  nextTriggerAt: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  category: 'freelance' | 'side_project' | 'certification';
  notes: string;
  status: 'backlog' | 'in_progress' | 'shipped';
  techStack?: string[];
  roadmap?: string[];
  valueProposition?: string;
  createdAt: string;
}

export interface CyberProfile {
  name: string;
  email: string;
  activeRole: PersonaType;
  uiMode: UiMode;
  certTargets: string[];
  dailyCapacityHours: number;
}

export interface DaemonStatus {
  online: boolean;
  daemonStartTime: string;
  uptimeSeconds: number;
  activeCount: number;
  totalReminders: number;
  serverTime: string;
}

export interface EmailLogItem {
  id: string;
  reminderId: string;
  title: string;
  recipient: string;
  timestamp: string;
  provider: string;
  status: string;
}
