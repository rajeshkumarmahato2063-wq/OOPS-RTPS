import React, { useState } from 'react';
import SlotCard from './SlotCard';
import { useParking } from '../../context/ParkingContext';
import { Search, Layers, Zap, Info } from 'lucide-react';

const SlotGrid = ({ onSelectSlot }) => {
  const { slots, zones, updateSlotStatus, checkOutVehicle } = useParking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch = 
      slot.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (slot.occupiedBy && slot.occupiedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (slot.reservedBy && slot.reservedBy.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZone = selectedZone === 'all' || slot.zoneId === selectedZone;
    const matchesStatus = selectedStatus === 'all' || slot.status === selectedStatus;
    const matchesType = selectedType === 'all' || slot.type === selectedType;

    return matchesSearch && matchesZone && matchesStatus && matchesType;
  });

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      setSelectedSlotId(slot.id);
      if (onSelectSlot) {
        onSelectSlot(slot);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Color Code Legend Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 backdrop-blur-xl">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-400" />
          Real-Time Slot Color Legend & Status Key
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-bold">Green = Available</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
            <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
            <span className="font-bold">Yellow = Reserved</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <span className="font-bold">Red = Occupied</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
            <span className="font-bold">Gray = Maintenance</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-950/60 border border-blue-500 text-blue-200">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <span className="font-bold">Blue = Selected</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search slot (e.g. A-01) or license plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Zones</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">🟢 Green (Available)</option>
            <option value="reserved">🟡 Yellow (Reserved)</option>
            <option value="occupied">🔴 Red (Occupied)</option>
            <option value="maintenance">⚪ Gray (Maintenance)</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Bay Types</option>
            <option value="standard">Standard Car</option>
            <option value="ev">⚡ EV Charger</option>
            <option value="vip">👑 VIP Bay</option>
            <option value="accessible">♿ Accessible</option>
          </select>

        </div>

      </div>

      {/* Live Grid Display */}
      {filteredSlots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No parking slots match your filter</h4>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              isSelected={selectedSlotId === slot.id}
              onSelectSlot={handleSlotClick}
              onToggleMaintenance={(id, newStatus) => updateSlotStatus(id, newStatus)}
              onCheckOut={(slotNum) => checkOutVehicle(slotNum)}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default SlotGrid;
