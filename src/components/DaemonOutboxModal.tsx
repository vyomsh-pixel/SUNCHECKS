// DaemonOutboxModal: Cyberpunk 2077 Telemetry & Neural Outbox Logs
// STRICT: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState } from 'react';
import { DaemonStatus, EmailLogItem, UiMode } from '../types';
import { X, Send, Mail, CheckCircle2 } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

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
    playCyberAlert();
    setIsSending(true);
    setSendResult(null);
    try {
      const ok = await onTriggerTestEmail(testEmail.trim());
      setSendResult(ok ? 'SUCCESS: Verification email dispatched to inbox via Resend!' : 'ERROR: Failed to dispatch.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#080910] border-2 border-[#00F0FF] p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto cyber-cut-card relative">
        
        {/* Top corner cyan hazard stripe */}
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe-cyan" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <TechBadge mode={uiMode} type="bot" size="sm" />
            <div>
              <h2 className="text-base font-cyber font-black tracking-wider text-[#00F0FF]">
                24/7 AUTONOMOUS DAEMON &amp; OUTBOX
              </h2>
              <p className="text-xs font-tech text-slate-400 mt-0.5">
                Minute-by-minute heartbeat telemetry &amp; live Resend email logs.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-[#FF003C] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-[#05060A] border-2 border-[#00FF66]/50 cyber-cut">
            <span className="text-[10px] font-cyber uppercase text-slate-400">DAEMON HEALTH</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  daemonStatus.online ? 'bg-[#00FF66] animate-ping' : 'bg-[#FCEE0A]'
                }`}
              />
              <span className="text-xs font-cyber font-bold text-[#00FF66]">
                {daemonStatus.online ? 'ONLINE 24/7' : 'LOCAL SYNC'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-[#05060A] border-2 border-[#00F0FF]/50 cyber-cut">
            <span className="text-[10px] font-cyber uppercase text-slate-400">ACTIVE UPTIME</span>
            <div className="mt-1 text-xs font-cyber font-bold text-[#00F0FF]">
              {formatUptime(daemonStatus.uptimeSeconds)}
            </div>
          </div>

          <div className="p-3.5 bg-[#05060A] border-2 border-[#FCEE0A]/50 cyber-cut">
            <span className="text-[10px] font-cyber uppercase text-slate-400">ARMED REMINDERS</span>
            <div className="mt-1 text-xs font-cyber font-bold text-[#FCEE0A]">
              {daemonStatus.activeCount} ACTIVE SCHEDULES
            </div>
          </div>
        </div>

        {/* Manual Test Dispatch Form */}
        <div className="mt-5 p-4 bg-[#0D0F1A] border-2 border-slate-800 cyber-cut">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-[#FCEE0A]" />
            <h4 className="text-xs font-cyber font-bold uppercase text-white">
              VERIFY 24/7 AUTO-EMAIL DISPATCH TO INBOX
            </h4>
          </div>
          <p className="text-xs font-tech text-slate-400 mb-3">
            Send an instant test cyberpunk reminder email to confirm delivery.
          </p>

          <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="rajkesir74@gmail.com"
              className="flex-1 bg-[#05060A] border-2 border-slate-700 px-3.5 py-2 text-xs font-tech text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
            />
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 cyber-btn-yellow text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'DISPATCHING...' : 'TEST INBOX PING'}</span>
            </button>
          </form>

          {sendResult && (
            <p
              className={`mt-2.5 text-xs font-tech font-bold ${
                sendResult.startsWith('SUCCESS') ? 'text-[#00FF66]' : 'text-[#FF003C]'
              }`}
            >
              {sendResult}
            </p>
          )}
        </div>

        {/* Outbox Activity Log */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-cyber font-bold uppercase text-slate-300">
              RECENT OUTBOX TRANSMISSIONS ({emailLogs.length})
            </span>
            <span className="text-xs font-tech text-slate-500">
              Live Resend API logs
            </span>
          </div>

          {emailLogs.length === 0 ? (
            <div className="p-8 text-center bg-[#05060A] border-2 border-slate-800 text-slate-500 text-xs font-tech cyber-cut">
              [NO DISPATCH LOGS YET. SCHEDULED REMINDERS WILL RECORD HERE AUTOMATICALLY]
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#05060A] border border-slate-800 flex items-center justify-between gap-3 text-xs font-tech cyber-cut"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <div className="truncate">
                      <p className="text-white font-bold truncate">{log.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        To: {log.recipient} &bull; Provider: [{log.provider}]
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#FCEE0A] font-bold shrink-0">
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
