import React from 'react';
import SlotGrid from '../../components/parking/SlotGrid';
import { Grid, Layers } from 'lucide-react';

const StaffSlotOverview = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Grid className="w-6 h-6 text-cyan-400" />
          Interactive Floor Map & Slot Status Control
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Staff floor operators can inspect slot telemetry or toggle maintenance state directly.
        </p>
      </div>

      <SlotGrid onSelectSlot={() => {}} />
    </div>
  );
};

export default StaffSlotOverview;
