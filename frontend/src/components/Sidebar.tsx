import React from 'react';
import { useAuthStore } from '../store/auth.store';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  Sliders,
  Cpu,
  BarChart3,
  LogOut,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'inbox'
  | 'customers'
  | 'reports'
  | 'campaigns'
  | 'automation'
  | 'api';

interface SidebarProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  unreadCount = 2,
}) => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox' as NavView, label: 'WhatsApp Inbox', icon: MessageSquare, badge: unreadCount },
    { id: 'customers' as NavView, label: 'Customers', icon: Users },
    { id: 'reports' as NavView, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'campaigns' as NavView, label: 'Campaigns', icon: Megaphone },
    { id: 'automation' as NavView, label: 'Automation & SLAs', icon: Sliders },
    { id: 'api' as NavView, label: 'WhatsApp API', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-[#091124] text-gray-300 flex flex-col justify-between shrink-0 select-none min-h-screen border-r border-[#15233e]">
      {/* Brand & Software Provider Header */}
      <div>
        <div className="p-5 border-b border-[#15233e] bg-[#070c1b]">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center shrink-0 w-11 h-11">
              <img
                src="/haloocom-logo.png"
                alt="HALOOCOM"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white tracking-wider truncate">
                HALOOCOM
              </h2>
              <span className="text-[10px] text-blue-400 font-mono tracking-tight block truncate">
                WhatsApp Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-blue-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-blue-400/80'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge != null && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold font-mono ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & logout */}
      <div className="p-4 border-t border-[#15233e] bg-[#060a16]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-700 border border-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || 'HALOOCOM Admin'}
              </div>
              <div className="text-[10px] text-gray-400 font-mono truncate">
                {user?.email || 'admin@haloocom.com'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;