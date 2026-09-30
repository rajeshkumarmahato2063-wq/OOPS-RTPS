import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = ['user', 'staff', 'admin'] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const targetRole = allowedRoles.find(r => r === 'admin') || allowedRoles.find(r => r === 'staff') || 'user';
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-white">403 - Access Denied</h2>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Your account role (<strong className="text-rose-400 uppercase font-mono">{user.role}</strong>) does not have permission to view Staff or Administrator controls.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => switchRole(targetRole)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <span>⚡ Switch to {targetRole.toUpperCase()} Role & Access</span>
          </button>

          <Link
            to={user.role === 'staff' ? '/staff' : user.role === 'admin' ? '/admin' : '/user'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {user.role.toUpperCase()} Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
