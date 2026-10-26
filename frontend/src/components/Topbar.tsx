import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { RefreshCw, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface TopbarProps {
  lastUpdated: Date;
  onRefresh: () => void;
  refreshing?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  lastUpdated,
  onRefresh,
  refreshing = false,
}) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-1 shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center shrink-0 w-10 h-10 border border-blue-500/30">
            <img
              src="/haloocom-logo.png"
              alt="HALOOCOM"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                HALOOCOM
              </span>
              <span className="text-blue-400 font-extrabold text-base tracking-tight">
                WhatsApp
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-gray-400 leading-none">
              Real-time Business Communication & Revenue Intelligence
            </p>
          </div>
        </div>

        {/* Center: Live Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            Live
          </span>
        </div>

        {/* Right: Last Updated + Refresh Button + User info + Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-[11px] text-gray-400">Last Synced</span>
            <span className="text-xs font-mono text-gray-300 font-medium">
              {format(lastUpdated, 'HH:mm:ss')}
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Dashboard Data"
            className="p-2 text-gray-300 hover:text-white bg-gray-900/90 hover:bg-gray-800 border border-gray-800 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`}
            />
          </button>

          {/* User profile capsule */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-800">
            <div className="w-8 h-8 rounded-full bg-blue-700 border border-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-200 leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-blue-400 uppercase font-mono font-medium">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;