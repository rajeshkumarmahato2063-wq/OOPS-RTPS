import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'indigo', badgeText }) => {
  const colors = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-400 border-indigo-500/20 icon-bg-indigo-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/20 icon-bg-emerald-500/20',
    rose: 'from-rose-500/10 to-rose-600/5 text-rose-400 border-rose-500/20 icon-bg-rose-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-400 border-amber-500/20 icon-bg-amber-500/20',
    cyan: 'from-cyan-500/10 to-cyan-600/5 text-cyan-400 border-cyan-500/20 icon-bg-cyan-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 text-purple-400 border-purple-500/20 icon-bg-purple-500/20'
  };

  const selectedColor = colors[color] || colors.indigo;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedColor} border p-5 backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-lg shadow-black/20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
        </div>

        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 shadow-inner">
              <Icon className="w-6 h-6" />
            </div>
          )}
          {badgeText && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white backdrop-blur-xs">
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
