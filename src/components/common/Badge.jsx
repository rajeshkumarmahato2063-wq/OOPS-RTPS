import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/30',
    occupied: 'bg-rose-500/10 text-rose-400 border-rose-500/20 ring-rose-500/30',
    reserved: 'bg-amber-500/10 text-amber-400 border-amber-500/20 ring-amber-500/30',
    maintenance: 'bg-slate-500/20 text-slate-300 border-slate-500/30 ring-slate-500/30',
    user: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    staff: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ev: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    vip: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    default: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-xs transition-all ${selectedVariant} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {children}
    </span>
  );
};

export default Badge;
