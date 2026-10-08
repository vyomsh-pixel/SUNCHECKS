// DaemonOutboxModal: Telemetry on 24/7 background mailer and dispatched logs
// STRICT RULE: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState } from 'react';
import { DaemonStatus, EmailLogItem, UiMode } from '../types';
import { X, Send, Mail, CheckCircle2 } from 'lucide-react';
import { TechBadge } from './TechBadge';

interface DaemonOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  daemonStatus: DaemonStatus;
  emailLogs: EmailLogItem[];
  userEmail: string;
  uiMode: UiMode;
  onTriggerTestEmail: (email: string) => Promise<boolean>;
}

export function DaemonOutboxModal({
  isOpen,
  onClose,
  daemonStatus,
  emailLogs,
  userEmail,
  uiMode,
  onTriggerTestEmail,
}: DaemonOutboxModalProps) {
  const [testEmail, setTestEmail] = useState(userEmail);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;
    setIsSending(true);
    setSendResult(null);
    try {
      const ok = await onTriggerTestEmail(testEmail.trim());
      setSendResult(ok ? 'SUCCESS: Verification email dispatched!' : 'ERROR: Failed to dispatch.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0A0F1D]/95 border border-cyan-500/30 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <TechBadge mode={uiMode} type="bot" size="sm" />
            <div>
              <h2 className="text-base font-bold font-mono tracking-wide text-cyan-300">
                24/7 AUTONOMOUS SCHEDULER & OUTBOX
              </h2>
              <p className="text-xs text-slate-400">
                Minute-by-minute heartbeat daemon telemetry and recent email dispatches.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#060A14] border border-cyan-500/20">
            <span className="text-[10px] font-mono uppercase text-slate-400">DAEMON HEALTH</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  daemonStatus.online ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-mono font-bold text-emerald-300">
                {daemonStatus.online ? 'ONLINE 24/7' : 'LOCAL SYNC'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#060A14] border border-cyan-500/20">
            <span className="text-[10px] font-mono uppercase text-slate-400">ACTIVE UPTIME</span>
            <div className="mt-1 text-xs font-mono font-bold text-cyan-300">
              {formatUptime(daemonStatus.uptimeSeconds)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#060A14] border border-cyan-500/20">
            <span className="text-[10px] font-mono uppercase text-slate-400">ARMED REMINDERS</span>
            <div className="mt-1 text-xs font-mono font-bold text-slate-100">
              {daemonStatus.activeCount} ACTIVE DIRECTIVES
            </div>
          </div>
        </div>

        {/* Manual Test Dispatch Form */}
        <div className="mt-5 p-4 rounded-xl bg-[#080D1A] border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-bold uppercase text-slate-200">
              VERIFY 24/7 AUTO-EMAIL DISPATCH TO INBOX
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Send an instant test cyberpunk reminder email to confirm delivery.
          </p>

          <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter destination email..."
              className="flex-1 rounded-lg bg-[#050811] border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'DISPATCHING...' : 'TEST INBOX PING'}</span>
            </button>
          </form>

          {sendResult && (
            <p
              className={`mt-2 text-xs font-mono font-bold ${
                sendResult.startsWith('SUCCESS') ? 'text-emerald-400' : 'text-pink-400'
              }`}
            >
              {sendResult}
            </p>
          )}
        </div>

        {/* Outbox Activity Log */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-300">
              RECENT OUTBOX TRANSMISSIONS ({emailLogs.length})
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Updated live from daemon
            </span>
          </div>

          {emailLogs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#060A14] border border-slate-800 text-slate-500 text-xs font-mono">
              [NO DISPATCH LOGS YET. SCHEDULED REMINDERS WILL RECORD HERE AUTOMATICALLY]
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-[#060A14] border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-slate-200 font-bold truncate">{log.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        To: {log.recipient} &bull; Provider: [{log.provider}]
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
