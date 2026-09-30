import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParking } from '../../context/ParkingContext';
import Badge from './Badge';
import { 
  Car, 
  Bell, 
  UserCheck, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = ({ toggleMobileSidebar }) => {
  const { user, logout, switchRole, isStaff, isAdmin } = useAuth();
  const { 
    availableSlots, 
    totalSlots, 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications 
  } = useParking();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleRoleChange = (role) => {
    switchRole(role);
    setShowRoleMenu(false);
    if (role === 'user') navigate('/user');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'admin') navigate('/admin');
  };

  const getNotifBadgeColor = (type) => {
    switch (type) {
      case 'Booking Confirmation': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Payment Success': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Cancellation': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Upcoming Booking': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Check-In': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Check-Out': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 lg:hidden transition-colors"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Fast<span className="text-indigo-400">Parking</span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.4
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">Smart Slot Management</p>
            </div>
          </Link>
        </div>

        {/* Center: Main Top Navbar Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
          {isAdmin ? (
            <>
              <NavLink to="/admin" end className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Dashboard</NavLink>
              <NavLink to="/admin/slots" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Slots Setup</NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Users Control</NavLink>
              <NavLink to="/admin/reports" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Reports</NavLink>
            </>
          ) : isStaff ? (
            <>
              <NavLink to="/staff" end className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Gate Terminal</NavLink>
              <NavLink to="/staff/slots" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Floor Status</NavLink>
              <NavLink to="/staff/check-in" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Gate Scanner</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Home</NavLink>
              <NavLink to="/user" end className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Dashboard</NavLink>
              <NavLink to="/user/find-parking" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Find Parking</NavLink>
              <NavLink to="/parking/slots" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>Select Slot</NavLink>
              <NavLink to="/user/bookings" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>My Bookings</NavLink>
              <NavLink to="/user/vehicles" className={({ isActive }) => `px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}>My Vehicles</NavLink>
            </>
          )}
        </nav>

        {/* Right Section: Live Availability, Role Quick-Switch, Notifications, Profile */}
        <div className="flex items-center gap-3">

          {/* Live Availability Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">
              <strong className="text-emerald-400">{availableSlots}</strong> of {totalSlots} slots free
            </span>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-xs hover:bg-slate-800/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="capitalize">{user?.role || 'Guest'} Mode</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  Switch Active Role
                </div>
                <button
                  onClick={() => handleRoleChange('user')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors ${user?.role === 'user' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'}`}
                >
                  <span>Driver / User View</span>
                  {user?.role === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
                <button
                  onClick={() => handleRoleChange('staff')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors ${user?.role === 'staff' ? 'text-cyan-400 font-bold bg-cyan-500/10' : 'text-slate-300'}`}
                >
                  <span>Staff Check-In Gate</span>
                  {user?.role === 'staff' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-500/10 hover:text-purple-300 transition-colors ${user?.role === 'admin' ? 'text-purple-400 font-bold bg-purple-500/10' : 'text-slate-300'}`}
                >
                  <span>Admin Operations</span>
                  {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          !n.read 
                            ? 'bg-slate-800/80 border-indigo-500/30' 
                            : 'bg-slate-900/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getNotifBadgeColor(n.type)}`}>
                            {n.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <div className="font-bold text-white text-xs mt-1">{n.title}</div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge & Logout */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white">{user.name}</div>
                <Badge variant={user.role}>{user.role}</Badge>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;
