// CyberTransmissionPortal: Real-Time Cyberpunk Email Transmission Modal
// STRICT: Zero yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState, useEffect, useRef } from 'react';
import { ReminderItem, UiMode } from '../types';
import { triggerReminderNow, TriggerResult } from '../storage';
import { Send, CheckCircle2, AlertTriangle, X, Terminal, Inbox, RefreshCw, Mail } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert, playCyberGlitch } from '../cyberAudio';

interface CyberTransmissionPortalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: ReminderItem | null;
  uiMode: UiMode;
  onOpenOutbox: () => void;
  onRefreshData?: () => void;
}

export function CyberTransmissionPortal({
  isOpen,
  onClose,
  reminder,
  uiMode,
  onOpenOutbox,
  onRefreshData,
}: CyberTransmissionPortalProps) {
  const [phase, setPhase] = useState<'idle' | 'transmitting' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && reminder) {
      setCustomEmail(reminder.email || 'rajkesir74@gmail.com');
      setPhase('idle');
      setLogs([
        `[${new Date().toLocaleTimeString()}] PORTAL ONLINE // DIRECTIVE LOADED`,
        `[${new Date().toLocaleTimeString()}] TARGET: "${reminder.title}"`,
        `[${new Date().toLocaleTimeString()}] RECIPIENT: ${reminder.email || 'rajkesir74@gmail.com'}`,
        `[${new Date().toLocaleTimeString()}] CADENCE: ${reminder.cadence.toUpperCase()} @ ${reminder.time}`,
      ]);
      setMessageId(null);
      setErrorMessage(null);
    }
  }, [isOpen, reminder]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen || !reminder) return null;

  const appendLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleStartDispatch = async () => {
    const targetEmail = customEmail.trim() || reminder.email;
    playCyberAlert();
    setPhase('transmitting');
    setErrorMessage(null);
    setMessageId(null);

    appendLog('INITIATING DISPATCH HANDSHAKE...');
    appendLog(`CONNECTING TO VERCEL SERVERLESS ENDPOINT /api/reminders/${reminder.id}...`);

    try {
      const res: TriggerResult = await triggerReminderNow(reminder.id, targetEmail);

      if (res.success) {
        appendLog(`RESEND RELAY ACKNOWLEDGED // 200 OK`);
        if (res.messageId) {
          appendLog(`TRANSMISSION MESSAGE ID: ${res.messageId}`);
          setMessageId(res.messageId);
        }
        appendLog('DIRECTIVE CONFIRMED // DISPATCH LOGGED TO INBOX');
        setPhase('success');
        playCyberAlert();
        if (onRefreshData) onRefreshData();
      } else {
        appendLog(`TRANSMISSION REJECTED: ${res.error || 'Unknown error'}`);
        setErrorMessage(res.error || 'Serverless dispatch failed');
        setPhase('error');
        playCyberGlitch();
      }
    } catch (err: any) {
      appendLog(`FATAL RELAY ERROR: ${err.message || 'Network failure'}`);
      setErrorMessage(err.message || 'Connection lost');
      setPhase('error');
      playCyberGlitch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#070912] border-2 border-[#00F0FF] p-6 shadow-[0_0_30px_rgba(0,240,255,0.3)] text-slate-100 max-h-[92vh] overflow-y-auto cyber-cut-card relative">
        
        {/* Top Hazard Accent */}
        <div className="absolute top-0 right-0 w-36 h-2.5 hazard-stripe-cyan" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <TechBadge mode={uiMode} type="bot" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                <h2 className="text-base font-cyber font-black tracking-wider text-[#00F0FF]">
                  TRANSMISSION PORTAL // INSTANT DISPATCH
                </h2>
              </div>
              <p className="text-xs font-tech text-slate-400 mt-0.5">
                Execute immediate email delivery to inbox via Resend relay engine.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-[#FF003C] hover:bg-white/5 cyber-cut transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Directive Details */}
        <div className="mt-5 p-4 bg-[#05060B] border border-slate-800 cyber-cut space-y-3 font-hud">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-[10px] font-cyber text-slate-400 uppercase">DIRECTIVE PAYLOAD</span>
              <h3 className="font-cyber text-sm font-bold text-white mt-0.5">{reminder.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-tech">
              <span className="px-2 py-0.5 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-bold cyber-cut">
                [{reminder.theme.toUpperCase()}]
              </span>
              <span className="px-2 py-0.5 bg-[#FCEE0A]/15 text-[#FCEE0A] border border-[#FCEE0A]/40 font-bold cyber-cut">
                {reminder.cadence.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Destination Email Input */}
          <div>
            <label className="block text-[11px] font-cyber text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>DISPATCH DESTINATION EMAIL</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={customEmail}
                disabled={phase === 'transmitting'}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="destination@domain.com"
                className="flex-1 bg-[#0A0D18] border border-slate-700 px-3 py-2 text-xs font-tech text-slate-100 focus:outline-none focus:border-[#00F0FF] cyber-cut"
              />
              {phase === 'idle' && (
                <button
                  type="button"
                  onClick={handleStartDispatch}
                  className="px-5 py-2 cyber-btn-yellow text-xs font-black flex items-center gap-2 shadow-[0_0_12px_rgba(252,238,10,0.4)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT NOW</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Terminal Telemetry Output */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-cyber text-slate-400 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>TELEMETRY CONSOLE</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">ENCRYPTION: 256-BIT RESEND RELAY</span>
          </div>
          <div
            ref={logContainerRef}
            className="p-3 bg-[#030408] border border-slate-800 font-mono text-[11px] text-[#00FF66] h-36 overflow-y-auto cyber-cut space-y-1 shadow-inner"
          >
            {logs.map((log, i) => (
              <div key={i} className="leading-tight">
                {log}
              </div>
            ))}
            {phase === 'transmitting' && (
              <div className="text-[#00F0FF] animate-pulse">
                &gt; RELAY PACKET IN FLIGHT... PLEASE WAIT...
              </div>
            )}
          </div>
        </div>

        {/* Phase Result Cards */}
        {phase === 'success' && (
          <div className="mt-4 p-4 bg-[#00FF66]/10 border-2 border-[#00FF66] cyber-cut space-y-2.5">
            <div className="flex items-center gap-2 text-[#00FF66] font-cyber text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
              <span>TRANSMISSION CONFIRMED // EMAIL DELIVERED TO INBOX</span>
            </div>
            <p className="text-xs font-tech text-slate-200 leading-relaxed">
              Resend confirmed email dispatch to <strong className="text-white">{customEmail || reminder.email}</strong>. 
              Check your inbox and spam folder for subject <span className="text-[#FCEE0A]">"[CyberPulse Instant] {reminder.title}"</span>.
            </p>
            {messageId && (
              <div className="p-2 bg-[#050912] border border-[#00FF66]/40 font-mono text-[11px] text-[#00FF66] flex items-center justify-between">
                <span>RESEND_MESSAGE_ID:</span>
                <span className="font-bold">{messageId}</span>
              </div>
            )}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  playCyberClick();
                  onClose();
                  onOpenOutbox();
                }}
                className="px-4 py-2 bg-[#090D1A] border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/15 text-xs font-cyber font-bold cyber-cut flex items-center gap-2 transition-all"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>INSPECT OUTBOX LOGS</span>
              </button>
              <button
                onClick={() => {
                  playCyberClick();
                  onClose();
                }}
                className="px-5 py-2 cyber-btn-cyan text-xs font-black"
              >
                [DISMISS PORTAL]
              </button>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="mt-4 p-4 bg-[#FF003C]/10 border-2 border-[#FF003C] cyber-cut space-y-2.5">
            <div className="flex items-center gap-2 text-[#FF003C] font-cyber text-xs font-black">
              <AlertTriangle className="w-4 h-4 text-[#FF003C]" />
              <span>TRANSMISSION REJECTED // DISPATCH FAILED</span>
            </div>
            <p className="text-xs font-tech text-slate-300 leading-relaxed">
              <strong className="text-[#FF003C]">Reason:</strong> {errorMessage || 'Delivery failed via Resend.'}
            </p>
            <div className="p-2.5 bg-[#0C0608] border border-[#FF003C]/40 text-[11px] font-tech text-slate-400 leading-relaxed">
              <span className="text-[#FCEE0A] font-bold block mb-1">DIAGNOSTIC GUIDANCE:</span>
              If using Resend default testing address (<code className="text-white">onboarding@resend.dev</code>), Resend restricts delivery strictly to the email address registered on your Resend account. Ensure your destination matches your Resend account email or verify your own domain in Resend.
            </div>
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={handleStartDispatch}
                className="px-4 py-2 cyber-btn-yellow text-xs font-black flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RETRY TRANSMISSION</span>
              </button>
              <button
                onClick={() => {
                  playCyberClick();
                  onClose();
                }}
                className="px-4 py-2 bg-[#080910] border border-slate-700 text-slate-300 hover:text-white text-xs font-hud cyber-cut"
              >
                [CLOSE]
              </button>
            </div>
          </div>
        )}

        {phase === 'transmitting' && (
          <div className="mt-4 p-4 bg-[#00F0FF]/10 border border-[#00F0FF]/50 cyber-cut flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#00F0FF] text-xs font-cyber font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00F0FF]" />
              <span>NEURAL DISPATCH IN PROGRESS... COMMUNICATING WITH RESEND</span>
            </div>
            <span className="text-[10px] font-mono text-[#FCEE0A] animate-pulse">TRANSMITTING...</span>
          </div>
        )}

      </div>
    </div>
  );
}
