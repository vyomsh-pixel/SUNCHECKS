import { useState, useEffect } from 'react';
import { DailyLog, UserProfile, MoodLevel } from './types';
import {
  getTodayLog,
  saveDailyLog,
  getUserProfile,
  saveUserProfile,
  calculateStreak,
  DEFAULT_HABITS,
} from './storage';
import { HEALTH_DISCLAIMER } from './gemini';
import { Header } from './components/Header';
import { MoodSelector } from './components/MoodSelector';
import { EnergyBattery } from './components/EnergyBattery';
import { HabitChecklist } from './components/HabitChecklist';
import { PromptCard } from './components/PromptCard';
import { BottomNav, NavTab } from './components/BottomNav';
import { AiRoutineModal } from './components/AiRoutineModal';
import { AdvisorModal } from './components/AdvisorModal';
import { TrendsModal } from './components/TrendsModal';
import { SettingsModal } from './components/SettingsModal';
import { Target, Heart, Moon } from 'lucide-react';

export default function App() {
  const [log, setLog] = useState<DailyLog>(getTodayLog());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [streak, setStreak] = useState<number>(calculateStreak());
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (profile.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.isDarkMode]);

  // Debounced save
  const updateLog = (newLog: DailyLog) => {
    setLog(newLog);
    saveDailyLog(newLog);
    setStreak(calculateStreak());
  };

  const handleSelectMood = (mood: MoodLevel) => {
    updateLog({ ...log, mood });
  };

  const handleChangeEnergy = (energy: number) => {
    updateLog({ ...log, energy });
  };

  const handleToggleHabit = (id: string) => {
    const isCompleted = log.completedHabits.includes(id);
    const updated = isCompleted
      ? log.completedHabits.filter((h) => h !== id)
      : [...log.completedHabits, id];
    updateLog({ ...log, completedHabits: updated });
  };

  const handleToggleDark = () => {
    const updated = { ...profile, isDarkMode: !profile.isDarkMode };
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleResetData = () => {
    setLog(getTodayLog());
    setProfile(getUserProfile());
    setStreak(calculateStreak());
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-paper-dark text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        streak={streak}
        isDark={profile.isDarkMode}
        onToggleDark={handleToggleDark}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Check-in Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-4 pb-24 space-y-4">
        {/* Grounding Greeting Banner */}
        <div className="py-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-sage-600 dark:text-sage-400">
            Daily Journal & Check-In
          </p>
          <h2 className="font-serif text-2xl font-normal text-slate-900 dark:text-slate-50 mt-0.5">
            Take a slow breath. Notice where you are.
          </h2>
        </div>

        {/* 1. Mood Selector */}
        <MoodSelector
          currentMood={log.mood}
          onSelectMood={handleSelectMood}
        />

        {/* 2. Energy Battery */}
        <EnergyBattery
          energy={log.energy}
          onChangeEnergy={handleChangeEnergy}
        />

        {/* 3. Micro Habits Checklist */}
        <HabitChecklist
          habits={DEFAULT_HABITS}
          completedIds={log.completedHabits}
          onToggleHabit={handleToggleHabit}
        />

        {/* 4. Focus Intention */}
        <PromptCard
          title="Daily Intention"
          subtitle="What is the single most meaningful focus today?"
          placeholder="e.g. Finish the proposal with calm clarity, without multitasking..."
          value={log.intention}
          icon={Target}
          onChange={(intention) => updateLog({ ...log, intention })}
          rows={2}
        />

        {/* 5. Gratitude Note */}
        <PromptCard
          title="Small Gratitude"
          subtitle="A simple moment or quiet comfort"
          placeholder="e.g. Warm tea by the window this morning..."
          value={log.gratitude}
          icon={Heart}
          onChange={(gratitude) => updateLog({ ...log, gratitude })}
          rows={2}
        />

        {/* 6. Evening Reflection */}
        <PromptCard
          title="Evening Reflection"
          subtitle="How was your day? What can you let go of?"
          placeholder="e.g. Managed the afternoon rush well. Leaving unresolved tasks for tomorrow..."
          value={log.reflection}
          icon={Moon}
          onChange={(reflection) => updateLog({ ...log, reflection })}
          rows={3}
        />

        {/* Prominent Wellness Disclaimer */}
        <div className="pt-4 pb-2 text-center border-t border-paper-200/80 dark:border-paper-darkBorder/60">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-md mx-auto italic">
            {HEALTH_DISCLAIMER}
          </p>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Modals for features */}
      <AiRoutineModal
        isOpen={activeTab === 'routine'}
        onClose={() => setActiveTab('today')}
        currentLog={log}
        apiKey={profile.geminiApiKey}
        onOpenSettings={() => {
          setActiveTab('today');
          setIsSettingsOpen(true);
        }}
      />

      <AdvisorModal
        isOpen={activeTab === 'advisor'}
        onClose={() => setActiveTab('today')}
        currentLog={log}
        apiKey={profile.geminiApiKey}
        onOpenSettings={() => {
          setActiveTab('today');
          setIsSettingsOpen(true);
        }}
      />

      <TrendsModal
        isOpen={activeTab === 'trends'}
        onClose={() => setActiveTab('today')}
        streak={streak}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={(p) => {
          setProfile(p);
          saveUserProfile(p);
        }}
        onDataReset={handleResetData}
      />
    </div>
  );
}
