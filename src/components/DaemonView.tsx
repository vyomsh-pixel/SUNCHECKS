// DaemonView: In-Place 24/7 Email Automation & Outbox History
// STRICT: Zero yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState } from 'react';
import { DaemonStatus, EmailLogItem, UiMode } from '../types';
import { Send, RefreshCw, Mail, Activity } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

interface DaemonViewProps {
  daemonStatus: DaemonStatus;
  emailLogs: EmailLogItem[];
  userEmail: string;
  uiMode: UiMode;
  onRefresh: () => void;
  onSendTestPing: (email: string) => Promise<boolean>;
}

export function DaemonView({
  daemonStatus,
  emailLogs,
  userEmail,
  uiMode,
  onRefresh,
  onSendTestPing,
}: DaemonViewProps) {
  const [testEmail, setTestEmail] = useState(userEmail);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;
    playCyberAlert();
    setIsSending(true);
    setSendResult(null);
    try {
      const ok = await onSendTestPing(testEmail.trim());
      setSendResult(ok ? 'SUCCESS: Verification email dispatched to inbox via Resend!' : 'FAILED: Could not dispatch.');
    } catch {
      setSendResult('ERROR: Network failure communicating with daemon.');
    } finally {
      setIsSending(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    if (mins > 0) return `${mins}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Daemon Engine Overview Card */}
      <div className="cyber-redone-container p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe-cyan" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <TechBadge mode={uiMode} type="bot" size="lg" />
            <div>
              <h2 className="font-cyber text-lg font-black tracking-wider text-[#00F0FF]">
                {uiMode === 'serious' ? '24/7 EMAIL AUTOMATION DAEMON' : 'AUTONOMOUS SPAM CANNON 24/7'}
              </h2>
              <p className="text-xs font-tech text-slate-300">
                Minute-by-minute heartbeat engine executing continuously via Node.js
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberClick();
              onRefresh();
            }}
            className="px-3.5 py-1.5 bg-[#090C16] border border-slate-700 hover:border-[#00F0FF] text-slate-300 hover:text-white cyber-cut text-xs font-tech flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>SYNC TELEMETRY</span>
          </button>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 font-hud">
          <div className="p-4 bg-[#05060A]/90 border-2 border-[#00FF66]/50 cyber-cut">
            <span className="text-[10px] font-cyber uppercase text-slate-400">ENGINE STATUS</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  daemonStatus.online ? 'bg-[#00FF66] animate-pulse shadow-[0_0_8px_#00FF66]' : 'bg-slate-600'
                }`}
              />
              <span className="text-sm font-cyber font-bold text-[#00FF66]">
                {daemonStatus.online ? 'ONLINE 24/7' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#05060A]/90 border-2 border-slate-800 cyber-cut">
            <span className="text-[10px] font-cyber uppercase text-slate-400">ARMED REMINDERS</span>
            <p className="text-sm font-cyber font-black text-[#FCEE0A] mt-1">
              {daemonStatus.activeCount} ACTIVE SCHEDULES
            </p>
          </div>

          <div className="p-4 bg-[#05060A]/90 border-2 border-slate-800 cyber-cut">
            <span className="text-[10px] font-cyber uppercase text-slate-400">OUTBOX DISPATCHES</span>
            <p className="text-sm font-cyber font-black text-white mt-1">
              {emailLogs.length} LOGGED EMAILS
            </p>
          </div>

          <div className="p-4 bg-[#05060A]/90 border-2 border-slate-800 cyber-cut">
            <span className="text-[10px] font-cyber uppercase text-slate-400">UPTIME</span>
            <p className="text-sm font-tech font-bold text-[#00F0FF] mt-1">
              {formatUptime(daemonStatus.uptimeSeconds)}
            </p>
          </div>
        </div>

        {/* Live Test Ping Form */}
        <div className="p-4 bg-[#04060B] border border-slate-800 cyber-cut space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-cyber text-[#00F0FF]">
              <Mail className="w-4 h-4 text-[#00F0FF]" />
              <span className="font-bold">INSTANT INBOX TEST DISPATCH</span>
            </div>
            <span className="text-[10px] font-tech text-slate-400">
              POWERED BY RESEND API
            </span>
          </div>

          <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter destination email..."
              className="flex-1 bg-[#090C16] border border-slate-700 px-3 py-2 text-xs font-hud text-slate-100 focus:outline-none focus:border-[#00F0FF] cyber-cut"
            />
            <button
              type="submit"
              disabled={isSending || !testEmail.trim()}
              className="px-5 py-2 cyber-btn-cyan text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'DISPATCHING...' : 'SEND TEST VERIFICATION'}</span>
            </button>
          </form>

          {sendResult && (
            <div
              className={`p-2.5 text-xs font-tech cyber-cut ${
                sendResult.includes('SUCCESS')
                  ? 'bg-[#00FF66]/15 border border-[#00FF66] text-[#00FF66]'
                  : 'bg-[#FF003C]/15 border border-[#FF003C] text-[#FF003C]'
              }`}
            >
              {sendResult}
            </div>
          )}
        </div>
      </div>

      {/* 2. Live Outbox Transmission History */}
      <div className="cyber-redone-container p-6 relative">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="font-cyber text-sm font-black tracking-wider uppercase text-white">
              OUTBOX TRANSMISSION AUDIT LOGS [{emailLogs.length}]
            </h3>
          </div>
          <span className="text-xs font-tech text-slate-400">24/7 BACKGROUND JOURNAL</span>
        </div>

        {emailLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-tech">
            <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">No transmissions logged yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Emails fire automatically when your active reminders hit their scheduled daily, weekday, interval, or random triggers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-tech text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-cyber">TIMESTAMP</th>
                  <th className="pb-2 font-cyber">RECIPIENT</th>
                  <th className="pb-2 font-cyber">REMINDER DIRECTIVE</th>
                  <th className="pb-2 font-cyber">GATEWAY</th>
                  <th className="pb-2 font-cyber text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {emailLogs.slice(0, 15).map((log) => {
                  const logDate = new Date(log.timestamp);
                  const formatted = isNaN(logDate.getTime())
                    ? log.timestamp
                    : logDate.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 text-slate-300">{formatted}</td>
                      <td className="py-2.5 text-[#00F0FF]">{log.recipient}</td>
                      <td className="py-2.5 text-white font-semibold font-hud">{log.title}</td>
                      <td className="py-2.5 text-[#FCEE0A] uppercase">{log.provider || 'RESEND'}</td>
                      <td className="py-2.5 text-right">
                        {(() => {
                          const isOk = ['sent', 'dispatched', 'instant_trigger', 'verification_sent'].includes(log.status);
                          return (
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold cyber-cut ${
                                isOk
                                  ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40'
                                  : 'bg-[#FF003C]/15 text-[#FF003C] border border-[#FF003C]/40'
                              }`}
                            >
                              {isOk ? 'DISPATCHED' : 'FAILED'}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
