export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodMeta {
  level: MoodLevel;
  label: string;
  sublabel: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface HabitItem {
  id: string;
  label: string;
  hint: string;
  iconName: string;
}

export interface DailyLog {
  date: string; // ISO 'YYYY-MM-DD'
  mood: MoodLevel;
  energy: number; // 1 to 10
  intention: string;
  gratitude: string;
  reflection: string;
  completedHabits: string[];
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  streakCount: number;
  lastActiveDate: string;
  geminiApiKey: string;
  isDarkMode: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface AiRoutine {
  theme: string;
  morningBlock: string;
  afternoonBlock: string;
  eveningWindDown: string;
  mindfulGrounding: string;
  generatedAt: string;
}
