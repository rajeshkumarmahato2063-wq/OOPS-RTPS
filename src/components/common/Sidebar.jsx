import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Navigation,
  CalendarCheck, 
  Car, 
  User,
  QrCode, 
  Grid, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  Sparkles,
  Zap,
  CheckSquare,
  CreditCard,
  Clock,
  Bell,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isUser, isStaff, isAdmin } = useAuth();

  const userNav = [
    { name: 'Dashboard', path: '/user', icon: LayoutDashboard },
    { name: 'Find Parking', path: '/user/find-parking', icon: Navigation },
    { name: 'My Bookings', path: '/user/bookings', icon: CalendarCheck },
    { name: 'My Vehicles', path: '/user/vehicles', icon: Car },
    { name: 'Payments', path: '/user/payments', icon: CreditCard },
    { name: 'Parking History', path: '/user/history', icon: Clock },
    { name: 'Notifications', path: '/user/notifications', icon: Bell },
    { name: 'Profile', path: '/user/profile', icon: User },
  ];

  const staffNav = [
    { name: 'Entry/Exit Terminal', path: '/staff', icon: QrCode },
    { name: 'Floor Status Map', path: '/staff/slots', icon: Grid },
    { name: 'Gate Scanner', path: '/staff/check-in', icon: CheckSquare },
  ];

  const adminNav = [
    { name: 'Dashboard Analytics', path: '/admin', icon: BarChart3 },
    { name: 'Slots & Zones Setup', path: '/admin/slots', icon: Grid },
    { name: 'Users & Access Control', path: '/admin/users', icon: Users },
    { name: 'Revenue Reports', path: '/admin/reports', icon: ShieldCheck },
  ];

  let currentNav = userNav;
  let roleTitle = 'Driver Dashboard';
  let badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

  if (isStaff) {
    currentNav = staffNav;
    roleTitle = 'Staff Gate Control';
    badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  } else if (isAdmin) {
    currentNav = adminNav;
    roleTitle = 'Admin Operations';
    badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-950/95 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            
            {/* Active Role Indicator */}
            <div className={`p-3 rounded-2xl border ${badgeColor} backdrop-blur-md`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{roleTitle}</span>
              </div>
              <p className="mt-1 text-[11px] opacity-80">
                Logged in as <strong className="text-white">{user?.name || 'Guest'}</strong>
              </p>
            </div>

            {/* Nav Group */}
            <nav className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Navigation Menu
              </div>
              {currentNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/user' || item.path === '/staff' || item.path === '/admin'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/20 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout Button */}
          <div className="space-y-3">
            <button
              onClick={() => {
                if (onClose) onClose();
                logout();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </div>
              <span className="text-[10px] text-slate-500">Session</span>
            </button>

            {/* Fast Pass Info */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-3.5 border border-slate-800/80 shadow-inner">
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="w-3.5 h-3.5 fill-indigo-400" />
                <span className="text-xs font-bold text-white">EV & VIP Auto-Pass</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
                Scan QR code at entry barrier for instant check-in.
              </p>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
