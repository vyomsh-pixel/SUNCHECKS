import React, { useState } from 'react';
import { UserProfile } from '../types';
import { exportBackupJson, importBackupJson } from '../storage';
import { Settings, X, Key, Download, Upload, Trash2, Check, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onDataReset,
}) => {
  const [apiKey, setApiKey] = useState(profile.geminiApiKey || '');
  const [savedKey, setSavedKey] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    onSaveProfile({ ...profile, geminiApiKey: apiKey.trim() });
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  const handleExport = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daypulse_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importBackupJson(content)) {
        setImportStatus('Backup restored successfully!');
        setTimeout(() => {
          setImportStatus(null);
          onDataReset();
        }, 1500);
      } else {
        setImportStatus('Invalid backup file.');
        setTimeout(() => setImportStatus(null), 2500);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your local logs? This cannot be undone.')) {
      localStorage.clear();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-paper-card dark:bg-paper-darkCard w-full max-w-lg rounded-3xl border border-paper-200 dark:border-paper-darkBorder shadow-xl overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-paper-200 dark:border-paper-darkBorder flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base text-slate-800 dark:text-slate-100">
                Settings & Privacy
              </h2>
              <p className="font-sans text-xs text-slate-400">
                Local-first configuration & backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* API Key */}
          <div className="p-4 rounded-2xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-medium">
                <Key className="w-4 h-4 text-sage-600" />
                <span>Gemini API Key</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300">
                Gemini 2.5 Flash
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your key stays safely stored in your browser&apos;s local storage and is never sent to any intermediary server.
            </p>

            <div className="flex space-x-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-paper-darkCard border border-paper-200 dark:border-paper-darkBorder focus:border-sage-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                {savedKey ? <Check className="w-4 h-4" /> : 'Save'}
              </button>
            </div>

            {savedKey && (
              <p className="text-[11px] text-sage-600 dark:text-sage-400 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Key saved locally.
              </p>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="p-4 rounded-2xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder space-y-3">
            <h3 className="font-medium text-slate-800 dark:text-slate-200">
              Data Backup & Portability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export all your daily check-ins to a JSON file or restore from a previous backup.
            </p>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 py-2 px-3 rounded-xl border border-paper-300 dark:border-paper-darkBorder hover:bg-paper-200/50 dark:hover:bg-paper-darkCard text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sage-600" />
                <span>Export JSON</span>
              </button>

              <label className="flex-1 py-2 px-3 rounded-xl border border-paper-300 dark:border-paper-darkBorder hover:bg-paper-200/50 dark:hover:bg-paper-darkCard text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-pond-600" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-medium text-sage-600 dark:text-sage-400">
                {importStatus}
              </p>
            )}
          </div>

          {/* Privacy & Reset */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
            <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300 font-medium text-xs">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>Zero-Tracking Guarantee</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              DayPulse is completely local-first. We do not run analytics, trackers, or external databases.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Local Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
