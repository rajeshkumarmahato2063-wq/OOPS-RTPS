import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import AlertBanner from '../../components/common/AlertBanner';
import { User, Mail, Phone, Car, Lock, ShieldCheck, CreditCard, Save, CheckCircle2 } from 'lucide-react';

const UserProfile = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'user@fastparking.com');
  const [phone, setPhone] = useState(user?.phone || '+1 555-0192');
  const [vehicle, setVehicle] = useState(user?.vehicle || 'NY-FAST-88');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    setTimeout(() => {
      setIsSaving(false);
      setFeedback({ type: 'success', message: 'Profile details updated successfully!' });
    }, 500);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setIsSaving(true);
    setFeedback(null);

    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setFeedback({ type: 'success', message: 'Account security password changed successfully.' });
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            User Account & Profile Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, primary vehicle registration, and security options.
          </p>
        </div>

        <Badge variant={user?.role || 'user'}>{user?.role || 'user'}</Badge>
      </div>

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Personal Info */}
        <div className="md:col-span-7 space-y-6">
          <form onSubmit={handleProfileSave} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Personal Profile Details
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Contact</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Vehicle License Plate</label>
              <div className="relative">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono uppercase font-bold text-sm tracking-wider focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Security & Payment Settings */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Security Form */}
          <form onSubmit={handlePasswordUpdate} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Security & Password
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !currentPassword || !newPassword}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all disabled:opacity-50"
            >
              Update Password
            </button>
          </form>

          {/* Quick Stats Summary */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Fast Pass Verified</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Your account is active and verified for automatic ALPR barrier access.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default UserProfile;
