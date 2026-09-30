import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Grid, Plus, Trash2, Edit, Layers, DollarSign, Zap } from 'lucide-react';

const AdminSlotManagement = () => {
  const { zones, slots, addSlot, deleteSlot, addZone, deleteZone } = useParking();

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);

  // New Slot Form State
  const [slotNum, setSlotNum] = useState('');
  const [slotZone, setSlotZone] = useState(zones[0]?.id || 'zone-a');
  const [slotType, setSlotType] = useState('standard');
  const [slotPrice, setSlotPrice] = useState(10);

  // New Zone Form State
  const [zoneName, setZoneName] = useState('');
  const [zoneFloor, setZoneFloor] = useState('1st Floor');
  const [zoneRate, setZoneRate] = useState(10);
  const [zoneDesc, setZoneDesc] = useState('');

  const handleAddSlotSubmit = (e) => {
    e.preventDefault();
    if (!slotNum) return;

    addSlot({
      number: slotNum.toUpperCase(),
      zoneId: slotZone,
      type: slotType,
      price: Number(slotPrice),
      features: slotType === 'ev' ? ['150kW Charger'] : slotType === 'vip' ? ['VIP Bay'] : ['Covered']
    });

    setSlotNum('');
    setShowAddSlot(false);
  };

  const handleAddZoneSubmit = (e) => {
    e.preventDefault();
    if (!zoneName) return;

    addZone({
      name: zoneName,
      floor: zoneFloor,
      ratePerHour: Number(zoneRate),
      description: zoneDesc || 'Standard Facility Zone'
    });

    setZoneName('');
    setShowAddZone(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Grid className="w-6 h-6 text-purple-400" />
            Slots & Facility Zones Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure layout, hourly pricing rates, and slot types.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddZone(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Add Zone</span>
          </button>
          <button
            onClick={() => setShowAddSlot(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Zone Cards Row */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Active Zones ({zones.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((zone) => {
            const count = slots.filter(s => s.zoneId === zone.id).length;
            return (
              <div key={zone.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{zone.floor}</span>
                  <button
                    onClick={() => deleteZone(zone.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{zone.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{zone.description}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs font-semibold">
                  <span className="text-slate-400">{count} Slots</span>
                  <span className="text-emerald-400">${zone.ratePerHour}/hr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slots Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Configured Parking Slots ({slots.length})</h2>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Slot Number</th>
                <th className="p-3.5">Zone</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Hourly Rate</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {slots.map((s) => {
                const z = zones.find(zn => zn.id === s.zoneId);
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-black text-white font-mono text-sm">{s.number}</td>
                    <td className="p-3.5 text-slate-300 font-medium">{z?.name || s.zoneId}</td>
                    <td className="p-3.5 capitalize font-semibold text-indigo-300">{s.type}</td>
                    <td className="p-3.5 font-bold text-emerald-400">${s.price}/hr</td>
                    <td className="p-3.5">
                      <Badge variant={s.status}>{s.status}</Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => deleteSlot(s.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddSlot && (
        <Modal isOpen={showAddSlot} onClose={() => setShowAddSlot(false)} title="Add New Parking Slot">
          <form onSubmit={handleAddSlotSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Slot Identifier Number</label>
              <input
                type="text"
                required
                placeholder="e.g. E-01"
                value={slotNum}
                onChange={(e) => setSlotNum(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Assigned Zone</label>
              <select
                value={slotZone}
                onChange={(e) => setSlotZone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Bay Classification</label>
              <select
                value={slotType}
                onChange={(e) => setSlotType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="standard">Standard Car Bay</option>
                <option value="ev">⚡ EV Fast Charging Bay</option>
                <option value="vip">👑 Executive VIP Bay</option>
                <option value="accessible">♿ Accessible Ramp Bay</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Hourly Price ($)</label>
              <input
                type="number"
                required
                min="1"
                value={slotPrice}
                onChange={(e) => setSlotPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Create Slot
            </button>
          </form>
        </Modal>
      )}

      {/* Add Zone Modal */}
      {showAddZone && (
        <Modal isOpen={showAddZone} onClose={() => setShowAddZone(false)} title="Create Facility Zone">
          <form onSubmit={handleAddZoneSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Zone Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Zone E - Solar Roof"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Floor Level</label>
              <input
                type="text"
                required
                placeholder="e.g. Roof Level"
                value={zoneFloor}
                onChange={(e) => setZoneFloor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Default Rate per Hour ($)</label>
              <input
                type="number"
                required
                min="1"
                value={zoneRate}
                onChange={(e) => setZoneRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description</label>
              <input
                type="text"
                placeholder="Key features..."
                value={zoneDesc}
                onChange={(e) => setZoneDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Create Zone
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminSlotManagement;
