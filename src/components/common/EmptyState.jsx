import React from 'react';
import { Layers, SearchX, CalendarX, Car, AlertCircle } from 'lucide-react';

const icons = {
  layers: Layers,
  search: SearchX,
  calendar: CalendarX,
  car: Car,
  alert: AlertCircle
};

const EmptyState = ({ 
  icon = 'layers', 
  title = 'No Data Available', 
  description = 'There are no items to display at this moment.', 
  actionText, 
  onAction 
}) => {
  const IconComponent = icons[icon] || Layers;

  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center space-y-3">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 border border-slate-700/50 flex items-center justify-center">
        <IconComponent className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
