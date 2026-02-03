
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { signInWithGoogle } from '../services/supabase';

export const AuthGate: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const anonKey = (window as any).process?.env?.SUPABASE_ANON_KEY;
  const isConfigMissing = !anonKey || anonKey === 'YOUR_SUPABASE_ANON_KEY' || anonKey === 'placeholder-key-missing' || anonKey === '';

  const handleLogin = async () => {
    setAuthError(null);
    setIsLoggingIn(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setAuthError(error.message);
    }
    setIsLoggingIn(false);
  };

  const isProviderDisabled = authError?.includes("provider is not enabled");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="dark-glass rounded-[3rem] p-12 shadow-2xl text-center space-y-10 border border-white/5">
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform -rotate-6">
              <ICONS.Brain className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Cognitive<span className="text-indigo-500">Sales</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Neural Intelligence Core</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-200">Secure Access Required</h2>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                Enter the strategic workspace. Our cognitive models require an authenticated profile to retain document memory.
              </p>
            </div>

            {isConfigMissing && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left">
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ICONS.Shield className="w-3 h-3" /> Developer Notice
                </p>
                <p className="text-amber-200/70 text-xs leading-relaxed">
                  Supabase configuration is not yet active. Please check your environment variables in <code>index.html</code>.
                </p>
              </div>
            )}

            {authError && (
              <div className={`border rounded-2xl p-5 text-left animate-in fade-in slide-in-from-top-2 duration-300 ${isProviderDisabled ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded ${isProviderDisabled ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    <ICONS.X className="w-3 h-3" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isProviderDisabled ? 'text-rose-400' : 'text-slate-400'}`}>
                    {isProviderDisabled ? 'Provider Not Enabled' : 'Authentication Error'}
                  </p>
                </div>
                
                {isProviderDisabled ? (
                  <div className="space-y-3">
                    <p className="text-rose-100/80 text-xs leading-relaxed">
                      Google login is disabled in your project. Follow these steps:
                    </p>
                    <ol className="text-[10px] text-rose-200/60 space-y-1.5 list-decimal pl-4 font-medium">
                      <li>Open <a href="https://supabase.com/dashboard/project/psywkhxrbgiriwzvcdpd/auth/providers" target="_blank" className="underline text-indigo-400">Supabase Auth Settings</a></li>
                      <li>Find <strong>Google</strong> and toggle it to <strong>Enabled</strong></li>
                      <li>Enter your Google Client ID & Secret</li>
                      <li>Set Redirect URI to <code>https://psywkhxrbgiriwzvcdpd.supabase.co/auth/v1/callback</code></li>
                    </ol>
                  </div>
                ) : (
                  <p className="text-slate-300 text-[10px] font-mono break-all">{authError}</p>
                )}
              </div>
            )}

            <button 
              onClick={handleLogin}
              disabled={isConfigMissing || isLoggingIn}
              className={`w-full flex items-center justify-center gap-4 px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl ${isConfigMissing || isLoggingIn ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] group'}`}
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
              {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <ICONS.Shield className="w-3 h-3 text-indigo-400" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Enterprise Security Verified</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              By signing in, you agree to our Terms of Strategic Service.
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest opacity-40">
          Cognitive Sales v2.5 • Grounded In Real Intelligence
        </p>
      </div>
    </div>
  );
};
