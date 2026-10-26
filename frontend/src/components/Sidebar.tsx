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
    <aside className="w-64 bg-white text-gray-700 flex flex-col justify-between shrink-0 select-none min-h-screen border-r border-gray-200">
      {/* Brand & Software Provider Header */}
      <div>
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative bg-white rounded-xl p-1.5 shadow-xs border border-gray-100 flex items-center justify-center shrink-0 w-11 h-11">
              <img
                src="/haloocom-logo.png"
                alt="HALOOCOM"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#25D366] rounded-full border border-white flex items-center justify-center text-white shadow-xs">
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.97 3.8 13.46 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                </svg>
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-gray-900 tracking-wider truncate leading-tight">
                HALOOCOM
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span className="text-[10px] text-blue-700 font-bold font-mono tracking-tight block truncate uppercase">
                  WhatsApp Enterprise
                </span>
              </div>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge != null && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold font-mono ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
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
      <div className="p-4 border-t border-gray-100 bg-gray-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-gray-900 truncate">
                {user?.name || 'HALOOCOM Admin'}
              </div>
              <div className="text-[10px] text-gray-500 font-mono truncate">
                {user?.email || 'admin@haloocom.com'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;