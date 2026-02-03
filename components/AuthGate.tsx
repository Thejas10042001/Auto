
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { signInWithGoogle } from '../services/supabase';

export const AuthGate: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const anonKey = (window as any).process?.env?.SUPABASE_ANON_KEY;
  const isConfigMissing = !anonKey || anonKey === 'YOUR_SUPABASE_ANON_KEY' || anonKey === 'placeholder-key-missing' || anonKey === '';

  // This is the project's Supabase Auth Callback URL which MUST be in Google Cloud Console
  const SUPABASE_CALLBACK_URL = "https://psywkhxrbgiriwzvcdpd.supabase.co/auth/v1/callback";

  const handleLogin = async () => {
    setAuthError(null);
    setIsLoggingIn(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setAuthError(error.message);
    }
    setIsLoggingIn(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_CALLBACK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="dark-glass rounded-[3rem] p-10 shadow-2xl text-center space-y-8 border border-white/5">
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/20 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              <ICONS.Brain className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                Cognitive<span className="text-indigo-500">Sales</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">Strategic Neural Intelligence</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">Secure Access Required</h2>
              <p className="text-slate-400 text-xs leading-relaxed px-4">
                Enter the strategic workspace. Our cognitive models require an authenticated profile to retain document memory.
              </p>
            </div>

            {isConfigMissing && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-left">
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Config Required</p>
                <p className="text-amber-200/60 text-[10px] leading-normal">
                  Supabase environment variables are missing in <code>index.html</code>.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                disabled={isConfigMissing || isLoggingIn}
                className={`w-full flex items-center justify-center gap-4 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${isConfigMissing || isLoggingIn ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] group'}`}
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {isLoggingIn ? 'Authenticating...' : 'Sign In with Google'}
              </button>

              <button 
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors"
              >
                {showTroubleshooting ? 'Hide Setup Guide' : 'Having trouble signing in?'}
              </button>
            </div>

            {/* Hidden Troubleshooting UI */}
            {showTroubleshooting && (
              <div className={`border rounded-3xl p-6 text-left space-y-4 bg-indigo-500/5 border-indigo-500/20 animate-in fade-in slide-in-from-top-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500 text-white rounded-lg"><ICONS.Efficiency className="w-3 h-3" /></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Connection Guide</p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    Whitelisting the callback URI in your Google Cloud Console fixes the <code>redirect_uri_mismatch</code> error.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">1. Copy Callback URL</p>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-black/40 rounded-xl text-[9px] text-indigo-300 font-mono break-all border border-white/5 select-all">
                        {SUPABASE_CALLBACK_URL}
                      </code>
                      <button 
                        onClick={copyToClipboard}
                        className={`px-3 rounded-xl text-[9px] font-black uppercase transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {copied ? 'Done' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">2. Update Console</p>
                    <ul className="text-[9px] text-slate-600 space-y-1 list-disc pl-4">
                      <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">Google Credentials</a></li>
                      <li>Edit your OAuth Client ID</li>
                      <li>Add the URL above to "Authorized redirect URIs"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
              Neural Network Security Protocol v2.5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
