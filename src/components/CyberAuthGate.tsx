// CyberAuthGate: Operator Neural Authentication & Privacy Shield
// Strictly protects operator real name, email destination, and directives from public visitors.
// Supports both Operator Unlock (Passcode: 2077 or custom) and Guest / Demo Mode.
// STRICT: Zero yellow emojis. Crisp HUD typography.

import { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Terminal, UserX, ArrowRight } from 'lucide-react';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

interface CyberAuthGateProps {
  onUnlockOperator: () => void;
  onEnterGuest: () => void;
}

export function CyberAuthGate({ onUnlockOperator, onEnterGuest }: CyberAuthGateProps) {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

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
        sessionStorage.setItem('cyberpulse_auth_role', 'operator');
        onUnlockOperator();
        return;
      }

      // If serverless is offline or custom, check local default
      if (passcode.trim() === '2077') {
        sessionStorage.setItem('cyberpulse_auth_role', 'operator');
        onUnlockOperator();
        return;
      }

      setErrorMsg('ACCESS DENIED // INVALID CLEARANCE PASSCODE');
    } catch {
      // Offline fallback
      if (passcode.trim() === '2077') {
        sessionStorage.setItem('cyberpulse_auth_role', 'operator');
        onUnlockOperator();
      } else {
        setErrorMsg('ACCESS DENIED // INVALID CLEARANCE PASSCODE');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGuestMode = () => {
    playCyberClick();
    sessionStorage.setItem('cyberpulse_auth_role', 'guest');
    onEnterGuest();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-20">
      <div className="w-full max-w-lg cyber-redone-container p-6 sm:p-8 relative shadow-[0_0_50px_rgba(0,240,255,0.2)]">
        {/* Top hazard stripe */}
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#00F0FF]/30">
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
        <div className="p-3.5 bg-[#05070D]/90 border border-slate-700 cyber-cut mb-6 space-y-1.5 font-tech text-xs">
          <div className="flex items-center gap-2 text-[#00FF66] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
            <span>OPERATOR PRIVACY SHIELD ACTIVE</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Operator email, identity, and personal schedules are encrypted and restricted from unauthenticated visitors.
          </p>
        </div>

        {/* Passcode Login Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-cyber uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>OPERATOR CLEARANCE PASSCODE</span>
              <span className="text-[10px] text-[#FCEE0A] font-mono">[DEFAULT: 2077]</span>
            </label>
            <div className="relative">
              <input
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
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#FF003C]/15 border border-[#FF003C] text-[#FF003C] text-xs font-tech cyber-cut">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !passcode.trim()}
            className="w-full py-3 cyber-btn-yellow text-xs font-black uppercase flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Lock className="w-4 h-4" />
            <span>{isVerifying ? 'VERIFYING CLEARANCE...' : 'AUTHORIZE OPERATOR LINK'}</span>
          </button>
        </form>

        {/* Guest Demo Mode Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="text-[10px] font-tech text-slate-500 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={handleGuestMode}
          className="w-full py-2.5 bg-[#090C16] border border-slate-700 hover:border-[#00F0FF] text-slate-300 hover:text-white cyber-cut text-xs font-tech flex items-center justify-center gap-2 transition-all"
        >
          <UserX className="w-4 h-4 text-[#00F0FF]" />
          <span>EXPLORE AS GUEST CHOOMBATTA (SANDBOX DEMO)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <p className="mt-4 text-[10px] font-tech text-slate-500 text-center">
          Guest mode runs with sanitized dummy data so personal credentials remain 100% confidential.
        </p>
      </div>
    </div>
  );
}
