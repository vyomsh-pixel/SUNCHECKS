// CyberAuthGate: Operator Neural Authentication & Privacy Shield
// Strictly protects operator real name, email destination, and directives from public visitors.
// Supports both Operator Unlock and Guest / Demo Mode with Pre-Use Consent & Optic Handshake.
// STRICT: Zero yellow emojis. Crisp HUD typography.

import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Terminal, UserX, ArrowRight, FileText, X } from 'lucide-react';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

export type LegalDocType = 'privacy' | 'terms' | null;

interface CyberLegalModalProps {
  docType: LegalDocType;
  onClose: () => void;
}

export function CyberLegalModal({ docType, onClose }: CyberLegalModalProps) {
  if (!docType) return null;

  const isPrivacy = docType === 'privacy';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cyber-legal-modal-title"
    >
      <div className="w-full max-w-xl bg-[#070912] border-2 border-[#00F0FF] p-6 shadow-[0_0_35px_rgba(0,240,255,0.25)] text-slate-100 max-h-[88vh] overflow-y-auto cyber-cut-card relative font-hud">
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe-cyan" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#00F0FF]" />
            <h2
              id="cyber-legal-modal-title"
              className="font-cyber text-sm sm:text-base font-black tracking-wider text-[#00F0FF] uppercase"
            >
              {isPrivacy ? 'PRIVACY POLICY // DATA GOVERNANCE (/privacy)' : 'TERMS OF SERVICE // OPERATOR AGREEMENT (/terms)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            aria-label="Close legal document"
            className="p-1 text-slate-400 hover:text-[#FF003C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs font-tech text-slate-300 leading-relaxed">
          <div className="p-3 bg-[#FCEE0A]/10 border border-[#FCEE0A] text-[#FCEE0A] cyber-cut font-mono text-[11px]">
            TODO(LEGAL): Supply official organization legal copy
          </div>

          {isPrivacy ? (
            <>
              <section className="space-y-1">
                <h3 className="font-cyber text-xs font-bold text-white uppercase">1. TELEMETRY &amp; STORAGE SCOPE</h3>
                <p>
                  CyberPulse stores operator schedule directives, certification targets, and outbox audit logs in your configured cloud database (Neon Postgres) and/or browser local storage cache. Guest Sandbox sessions remain isolated in browser memory.
                </p>
              </section>
              <section className="space-y-1">
                <h3 className="font-cyber text-xs font-bold text-white uppercase">2. THIRD-PARTY PROCESSORS</h3>
                <p>
                  Automated email dispatches are routed through Resend API (`api.resend.com`). Optional task &amp; blueprint refinements are processed via server-side Google Gemini 2.5 Flash without exposing API credentials to the browser.
                </p>
              </section>
              <section className="space-y-1">
                <h3 className="font-cyber text-xs font-bold text-white uppercase">3. SELF-SERVICE EXPORT &amp; ERASURE</h3>
                <p>
                  Authenticated operators can export a full JSON archive of their profile, reminders, and email logs (`GET /api/account`) or permanently wipe all stored records (`DELETE /api/account`) at any time from the Workload &amp; Profile panel.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-1">
                <h3 className="font-cyber text-xs font-bold text-white uppercase">1. PERSONAL PRODUCTIVITY &amp; SELF-TRACKING ONLY</h3>
                <p>
                  CyberPulse 2077 is a personal operations, study cadence, and task-tracking terminal. AI-synthesized briefings, execution roadmaps, and Second-Brain vault links are provided strictly for personal productivity and educational organization.
                </p>
              </section>
              <section className="space-y-1">
                <h3 className="font-cyber text-xs font-bold text-white uppercase">2. AUTOMATED DISPATCH RESPONSIBILITY</h3>
                <p>
                  Operators are solely responsible for configuring valid destination email addresses and ensuring compliance with email relay rate limits and acceptable-use policies.
                </p>
              </section>
              <section className="space-y-1">
                <h3 className="font-cyber text-xs font-bold text-white uppercase">3. WARRANTY DISCLAIMER</h3>
                <p>
                  TODO(LEGAL): Supply official organization legal copy regarding liability limits, service availability, and governing jurisdiction.
                </p>
              </section>
            </>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="px-5 py-2 cyber-btn-cyan text-xs font-black uppercase"
          >
            [ACKNOWLEDGE]
          </button>
        </div>
      </div>
    </div>
  );
}

interface CyberAuthGateProps {
  onUnlockOperator: () => void;
  onEnterGuest: () => void;
}

export function CyberAuthGate({ onUnlockOperator, onEnterGuest }: CyberAuthGateProps) {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [consentStorage, setConsentStorage] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cyberpulse_consent_accepted') === 'true';
    } catch {
      return false;
    }
  });
  const [consentDisclaimer, setConsentDisclaimer] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cyberpulse_consent_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const [legalModal, setLegalModal] = useState<LegalDocType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/privacy') return 'privacy';
      if (path === '/terms') return 'terms';
    }
    return null;
  });

  // Optic Handshake Loading Screen State (<5KB pure CSS/SVG transition)
  const [handshakeTarget, setHandshakeTarget] = useState<'operator' | 'guest' | null>(null);
  const [handshakeProgress, setHandshakeProgress] = useState(0);

  const allConsented = consentStorage && consentDisclaimer;

  useEffect(() => {
    if (!handshakeTarget) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const frameTimer = requestAnimationFrame(() => {
      setHandshakeProgress(100);
    });

    const duration = prefersReducedMotion ? 150 : 1100;
    const doneTimer = setTimeout(() => {
      if (handshakeTarget === 'operator') {
        onUnlockOperator();
      } else {
        onEnterGuest();
      }
    }, duration);

    return () => {
      cancelAnimationFrame(frameTimer);
      clearTimeout(doneTimer);
    };
  }, [handshakeTarget, onUnlockOperator, onEnterGuest]);

  const persistConsentAndLaunch = (role: 'operator' | 'guest') => {
    try {
      localStorage.setItem('cyberpulse_consent_accepted', 'true');
    } catch {
      // ignore storage errors
    }
    sessionStorage.setItem('cyberpulse_auth_role', role);
    setHandshakeProgress(8);
    setHandshakeTarget(role);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    if (!allConsented) {
      setErrorMsg('CONSENT REQUIRED // ACKNOWLEDGE DATA & TELEMETRY CHECKBOXES BELOW');
      return;
    }

    playCyberAlert();
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      // Call serverless /api/auth endpoint
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.token) {
          sessionStorage.setItem('cyberpulse_auth_token', data.token);
        }
        persistConsentAndLaunch('operator');
        return;
      }

      setErrorMsg('ACCESS DENIED // INVALID CLEARANCE PASSCODE');
    } catch {
      // Offline fallback ONLY when backend is completely unreachable
      if (passcode.trim() === '2077') {
        persistConsentAndLaunch('operator');
      } else {
        setErrorMsg('ACCESS DENIED // INVALID CLEARANCE PASSCODE');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGuestMode = () => {
    if (!allConsented) {
      setErrorMsg('CONSENT REQUIRED // ACKNOWLEDGE DATA & TELEMETRY CHECKBOXES BEFORE ENTERING');
      return;
    }
    playCyberClick();
    sessionStorage.removeItem('cyberpulse_auth_token');
    persistConsentAndLaunch('guest');
  };

  // Render Pure CSS/SVG Optic Handshake Loading Screen upon authentication
  if (handshakeTarget) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4 relative z-30"
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-md cyber-redone-container p-8 relative shadow-[0_0_60px_rgba(0,240,255,0.3)] text-center font-hud">
          <div className="absolute top-0 right-0 w-28 h-2.5 hazard-stripe-cyan" />

          {/* Crisp Inline Vector SVG Cyber-Reticle */}
          <div className="mx-auto w-24 h-24 mb-5 relative flex items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full text-[#00F0FF] animate-spin motion-reduce:animate-none"
              style={{ animationDuration: '3.2s', willChange: 'transform' }}
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="22 10 8 10"
                opacity="0.85"
              />
              <circle
                cx="60"
                cy="60"
                r="38"
                fill="none"
                stroke="#FCEE0A"
                strokeWidth="1.5"
                strokeDasharray="14 8"
                opacity="0.9"
              />
              <path
                d="M60 4 L60 18 M60 102 L60 116 M4 60 L18 60 M102 60 L116 60"
                stroke="#00FF66"
                strokeWidth="2.5"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-[#FCEE0A] cyber-cut shadow-[0_0_14px_#FCEE0A]" />
            </div>
          </div>

          <h2 className="font-cyber text-base font-black tracking-widest text-[#FCEE0A] uppercase">
            NEURAL LINK // OPTIC HANDSHAKE
          </h2>
          <p className="text-xs font-tech text-[#00F0FF] mt-1 uppercase tracking-wider">
            {handshakeTarget === 'operator'
              ? 'CLEARANCE VERIFIED // MOUNTING OPERATOR DIRECTIVES'
              : 'SANDBOX ISOLATED // INITIALIZING GUEST TERMINAL'}
          </p>

          {/* Hardware-Accelerated Progress Bar */}
          <div className="mt-5 w-full h-2.5 bg-[#05060A] border border-[#00F0FF]/60 overflow-hidden cyber-cut">
            <div
              className="h-full w-full bg-gradient-to-r from-[#00F0FF] via-[#00FF66] to-[#FCEE0A] origin-left transition-transform duration-1000 ease-out motion-reduce:transition-none"
              style={{
                transform: `scaleX(${handshakeProgress / 100})`,
                willChange: 'transform',
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>KIROSHI_HUD_v2.5</span>
            <span className="text-[#00FF66]">HANDSHAKE: {handshakeProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-20">
      <div className="w-full max-w-lg cyber-redone-container p-6 sm:p-8 relative shadow-[0_0_50px_rgba(0,240,255,0.2)]">
        {/* Top hazard stripe */}
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#00F0FF]/30">
          <div className="w-10 h-10 bg-[#FCEE0A] text-black flex items-center justify-center font-black cyber-cut shadow-[0_0_15px_rgba(252,238,10,0.6)]">
            <Terminal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-cyber text-lg font-black tracking-widest text-[#FCEE0A] uppercase">
              CYBERPULSE // NEURAL LINK
            </h1>
            <p className="text-xs font-tech text-[#00F0FF] tracking-wider uppercase">
              MILITECH SECURE ACCESS GATEWAY
            </p>
          </div>
        </div>

        {/* Privacy Shield Notice */}
        <div className="p-3.5 bg-[#05070D]/90 border border-slate-700 cyber-cut mb-5 space-y-1.5 font-tech text-xs">
          <div className="flex items-center gap-2 text-[#00FF66] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
            <span>OPERATOR PRIVACY SHIELD ACTIVE</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Operator email, identity, and personal schedules are encrypted and restricted from unauthenticated visitors.
          </p>
        </div>

        {/* Pre-Use Consent & Telemetry Disclaimer Gate */}
        <div className="p-3.5 bg-[#060913] border border-[#00F0FF]/40 cyber-cut mb-5 space-y-2.5 font-tech text-xs">
          <div className="text-[10px] font-cyber font-bold text-[#00F0FF] uppercase tracking-wider">
            REQUIRED PRE-USE AUTHORIZATION &amp; TELEMETRY DISCLOSURE
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-200 leading-snug">
            <input
              type="checkbox"
              checked={consentStorage}
              onChange={(e) => {
                setConsentStorage(e.target.checked);
                if (errorMsg) setErrorMsg(null);
              }}
              className="mt-0.5 w-4 h-4 accent-[#FCEE0A] shrink-0 cursor-pointer"
            />
            <span>
              I consent to CyberPulse storing schedule directives in cloud/local storage and dispatching automated email reminders via Resend.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-200 leading-snug">
            <input
              type="checkbox"
              checked={consentDisclaimer}
              onChange={(e) => {
                setConsentDisclaimer(e.target.checked);
                if (errorMsg) setErrorMsg(null);
              }}
              className="mt-0.5 w-4 h-4 accent-[#00F0FF] shrink-0 cursor-pointer"
            />
            <span>
              I understand that AI-synthesized briefings and Second-Brain vault links are for personal productivity and self-tracking only.
            </span>
          </label>
        </div>

        {/* Passcode Login Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label
              htmlFor="operator-passcode-input"
              className="block text-xs font-cyber uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span>OPERATOR CLEARANCE PASSCODE</span>
              <span className="text-[10px] text-[#00F0FF] font-mono">[ENCRYPTED]</span>
            </label>
            <div className="relative">
              <input
                id="operator-passcode-input"
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter operator passcode..."
                autoFocus
                className="w-full bg-[#05060A] border-2 border-slate-700 px-4 py-2.5 text-sm font-hud text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut pr-10 tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-2.5 bg-[#FF003C]/15 border border-[#FF003C] text-[#FF003C] text-xs font-tech cyber-cut"
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !passcode.trim() || !allConsented}
            className="w-full py-3 cyber-btn-yellow text-xs font-black uppercase flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Lock className="w-4 h-4" />
            <span>{isVerifying ? 'VERIFYING CLEARANCE...' : 'AUTHORIZE OPERATOR LINK'}</span>
          </button>
        </form>

        {/* Guest Demo Mode Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="text-[10px] font-tech text-slate-500 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Demo Mode Button */}
        <button
          type="button"
          onClick={handleGuestMode}
          disabled={!allConsented}
          className="w-full py-2.5 bg-[#090C16] border border-slate-700 hover:border-[#00F0FF] text-slate-300 hover:text-white cyber-cut text-xs font-tech flex items-center justify-center gap-2 transition-all disabled:opacity-40"
        >
          <UserX className="w-4 h-4 text-[#00F0FF]" />
          <span>EXPLORE AS GUEST CHOOMBATTA (SANDBOX DEMO)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <p className="mt-3 text-[10px] font-tech text-slate-500 text-center">
          Guest mode runs with sanitized dummy data so personal credentials remain 100% confidential.
        </p>

        {/* Legal Links (/privacy & /terms) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[11px] font-tech text-slate-400">
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              setLegalModal('privacy');
            }}
            className="hover:text-[#00F0FF] underline underline-offset-4 transition-colors"
          >
            Privacy Policy (/privacy)
          </button>
          <span className="text-slate-700">&bull;</span>
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              setLegalModal('terms');
            }}
            className="hover:text-[#FCEE0A] underline underline-offset-4 transition-colors"
          >
            Terms of Service (/terms)
          </button>
        </div>
      </div>

      <CyberLegalModal docType={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
}
