
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { signOut } from '../services/supabase';

interface HeaderProps {
  user?: any;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-md">
            <ICONS.Brain />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">
            Cognitive<span className="text-indigo-600">Sales</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <a href="#" className="text-indigo-600">Intelligence</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Documents</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Team Strategy</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
              >
                <img 
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-indigo-100 group-hover:scale-110 transition-transform"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Strategist</p>
                  <p className="text-xs font-bold text-slate-700 max-w-[120px] truncate">{user.user_metadata?.full_name || user.email}</p>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                   <div className="px-4 py-3 border-b border-slate-50 mb-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Signed In As</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                   </div>
                   <button 
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-xs font-bold"
                   >
                     <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg group-hover:bg-rose-100">
                       <ICONS.X className="w-3.5 h-3.5" />
                     </div>
                     Sign Out Hub
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
