import React from 'react';
import Badge from '../common/Badge';
import { Zap, Crown, Accessibility, Car, Wrench, Clock, User, CheckCircle, Lock, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SlotCard = ({ slot, isSelected = false, onSelectSlot, onToggleMaintenance, onCheckOut }) => {
  const { isStaff, isAdmin } = useAuth();

  const typeIcons = {
    ev: <Zap className="w-4 h-4 text-teal-400 fill-teal-400/20" />,
    vip: <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" />,
    accessible: <Accessibility className="w-4 h-4 text-cyan-400" />,
    standard: <Car className="w-4 h-4 text-slate-400" />
  };

  // Color-coded visual theme rules:
  // Green = Available | Yellow = Reserved | Red = Occupied | Gray = Maintenance | Blue = Selected
  const colorStyles = {
    available: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 text-emerald-300 shadow-emerald-500/10',
    reserved: 'border-amber-500/40 bg-amber-950/20 text-amber-300 shadow-amber-500/10 cursor-not-allowed',
    occupied: 'border-rose-500/40 bg-rose-950/20 text-rose-300 shadow-rose-500/10 cursor-not-allowed',
    maintenance: 'border-slate-700 bg-slate-900/60 text-slate-400 opacity-75 cursor-not-allowed',
    selected: 'border-blue-500 bg-blue-950/40 text-blue-200 ring-2 ring-blue-500/60 scale-[1.03] shadow-blue-500/20'
  };

  const activeStyle = isSelected ? colorStyles.selected : (colorStyles[slot.status] || colorStyles.available);

  const handleClick = () => {
    if (slot.status !== 'available') {
      alert(`Slot ${slot.number} is currently ${slot.status.toUpperCase()} and cannot be selected.`);
      return;
    }
    if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative rounded-2xl border p-4 transition-all duration-200 shadow-lg cursor-pointer ${activeStyle}`}
    >
      
      {/* Visual Status Dot Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isSelected 
              ? 'bg-blue-400 animate-pulse' 
              : slot.status === 'available' 
              ? 'bg-emerald-400' 
              : slot.status === 'reserved' 
              ? 'bg-amber-400' 
              : slot.status === 'occupied' 
              ? 'bg-rose-500' 
              : 'bg-slate-500'
          }`} />
          <span className="text-xl font-black tracking-tight text-white">{slot.number}</span>
          <div className="p-1 rounded-lg bg-slate-900 border border-slate-800">
            {typeIcons[slot.type] || typeIcons.standard}
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
          isSelected
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            : slot.status === 'available'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : slot.status === 'reserved'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : slot.status === 'occupied'
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {isSelected ? 'Blue (Selected)' : slot.status}
        </span>
      </div>

      {/* Pricing & Features */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
        <span className="font-semibold text-slate-400">
          <strong className="text-lg text-white font-bold">${slot.price}</strong> / hr
        </span>
        <div className="flex items-center gap-1">
          {slot.features?.map((feat, idx) => (
            <span key={idx} className="text-[10px] font-medium bg-slate-950 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Occupied Details */}
      {slot.status === 'occupied' && (
        <div className="mt-3 rounded-xl bg-slate-950/90 border border-rose-500/20 p-2.5 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Occupied Plate:</span>
            <span className="font-bold text-rose-400 font-mono tracking-wider">{slot.occupiedBy || 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Reserved Details */}
      {slot.status === 'reserved' && (
        <div className="mt-3 rounded-xl bg-slate-950/90 border border-amber-500/20 p-2.5 text-xs flex items-center justify-between">
          <span className="text-slate-400">Reserved for:</span>
          <span className="font-bold text-amber-300 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> {slot.reservedBy || 'Driver'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center gap-2">
        {slot.status === 'available' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectSlot(slot);
            }}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              isSelected
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            {isSelected ? <Check className="w-4 h-4" /> : null}
            <span>{isSelected ? 'Selected (Book Now)' : 'Select Available Slot'}</span>
          </button>
        )}

        {slot.status !== 'available' && (
          <div className="w-full text-center py-1.5 text-[11px] font-semibold text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Unavailable for Selection</span>
          </div>
        )}

        {slot.status === 'occupied' && (isStaff || isAdmin) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckOut(slot.number);
            }}
            className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold text-xs transition-all"
            title="Gate Exit Check-Out"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}

        {(isStaff || isAdmin) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaintenance(slot.id, slot.status === 'maintenance' ? 'available' : 'maintenance');
            }}
            title="Toggle Maintenance"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Wrench className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};

export default SlotCard;
