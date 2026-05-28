"use client";

import React from "react";
import { Lock, AlertCircle, ShieldCheck } from "lucide-react";

interface GatekeeperProps {
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  authError: string;
  setAuthError: (val: string) => void;
  handleAuthSubmit: (e: React.FormEvent) => void;
}

export default function Gatekeeper({
  passwordInput,
  setPasswordInput,
  authError,
  setAuthError,
  handleAuthSubmit
}: GatekeeperProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] text-slate-100 flex-col p-6 font-sans relative overflow-hidden select-none">
      {/* Background Ambient Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Gate Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-2xl p-8 relative z-10 shadow-2xl flex flex-col items-center">
        
        {/* Animated Lock Icon Portal */}
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center mb-6 relative animate-pulse">
          <Lock className="text-blue-400 w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2 text-center">Pixple API Gatekeeper</h2>
        <p className="text-xs text-slate-400 text-center mb-8 max-w-sm leading-relaxed">
          보안 유지를 위해 개발 리소스 및 API Sandbox 접근이 차단되어 있습니다. 계속하려면 승인된 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Security Password
            </label>
            <input
              type="password"
              placeholder="비밀번호 입력..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (authError) setAuthError("");
              }}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
              required
            />
          </div>

          {authError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-100 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-normal text-red-300">{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/15"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Gateway Credentials</span>
          </button>
        </form>

        {/* Quick Credential Tip for sandbox administrators */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-500">
          <span>Server Instance: Live-2026</span>
          <span className="font-mono bg-slate-950 px-2 py-1 rounded text-blue-400/90 border border-slate-800">Default: PIxpleADMIN</span>
        </div>

      </div>
    </div>
  );
}
