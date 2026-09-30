import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { 
  QrCode, 
  ArrowDownRight, 
  ArrowUpRight, 
  Car, 
  CheckCircle2, 
  CalendarCheck, 
  Clock, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  XCircle,
  TrendingUp,
  Layers
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { 
    slots, 
    bookings, 
    checkInVehicle, 
    checkOutVehicle, 
    occupiedSlots, 
    availableSlots, 
    totalSlots,
    activityLogs 
  } = useParking();

  const [activeTab, setActiveTab] = useState('checkin'); // checkin, checkout, qrscanner
  const [inputPlate, setInputPlate] = useState('');
  const [selectedSlotNum, setSelectedSlotNum] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('Sedan');
  const [actionMessage, setActionMessage] = useState(null);

  // QR Scanner verification state
  const [scanQuery, setScanQuery] = useState('');
  const [qrResult, setQrResult] = useState(null);

  // Dynamic calculations for requested metrics:
  // 1. Today's Bookings
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysBookingsCount = bookings.filter(b => {
    const bDate = b.startTime ? new Date(b.startTime).toISOString().split('T')[0] : todayStr;
    return bDate === todayStr;
  }).length;

  // 2. Active Vehicles
  const activeVehiclesCount = occupiedSlots;

  // 3. Upcoming Reservations
  const upcomingReservations = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Upcoming');

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    if (!inputPlate || !selectedSlotNum) return;

    const res = checkInVehicle(selectedSlotNum, inputPlate.toUpperCase().trim(), vehicleCategory);
    if (res.success) {
      setActionMessage({ type: 'success', text: `Vehicle ${inputPlate.toUpperCase()} checked into Slot ${selectedSlotNum} successfully!` });
      setInputPlate('');
      setSelectedSlotNum('');
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
  };

  const handleCheckOutSubmit = (e, slotNum) => {
    if (e) e.preventDefault();
    const targetSlot = slotNum || selectedSlotNum;
    if (!targetSlot) return;

    const res = checkOutVehicle(targetSlot);
    if (res.success) {
      setActionMessage({ 
        type: 'success', 
        text: `Vehicle checked out from Slot ${targetSlot}. Duration: ${res.durationHours} hrs. Fee collected: $${res.totalFee}.00` 
      });
      setSelectedSlotNum('');
    }
  };

  const handleScanQR = (e) => {
    e.preventDefault();
    if (!scanQuery.trim()) return;

    const query = scanQuery.trim().toUpperCase();
    const foundBooking = bookings.find(b => 
      b.id.toUpperCase() === query || 
      (b.qrCode && b.qrCode.toUpperCase().includes(query)) ||
      b.licensePlate.toUpperCase() === query
    );

    if (!foundBooking) {
      setQrResult({ status: 'invalid', title: '❌ Invalid Booking Code', message: 'No matching reservation code found.' });
      return;
    }

    if (foundBooking.status === 'Cancelled') {
      setQrResult({ status: 'cancelled', title: '⛔ Booking Cancelled', message: 'Driver cancelled this reservation.' });
      return;
    }

    if (foundBooking.status === 'Checked-In' || foundBooking.status === 'Completed') {
      setQrResult({ status: 'used', title: '⚠️ Already Used', message: 'Single-use QR pass already scanned.' });
      return;
    }

    setQrResult({
      status: 'approved',
      title: '✅ QR Verified & Valid',
      message: `Pass ${foundBooking.id} is VALID for Slot ${foundBooking.slotNumber} • Plate: ${foundBooking.licensePlate}`,
      booking: foundBooking
    });
  };

  const occupiedSlotList = slots.filter(s => s.status === 'occupied');
  const availableSlotList = slots.filter(s => s.status === 'available');

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-cyan-400" />
            Staff Gate Terminal & Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gate Operator: <strong className="text-cyan-300">{user?.name || 'Officer Sarah'}</strong> • Access Scoped to Gate Controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            ALPR Gate Barrier Online
          </span>
        </div>
      </div>

      {/* 5 Required Metrics Cards Row: Today's Bookings, Active Vehicles, Available Slots, Occupied Slots, Upcoming Reservations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Today's Bookings"
          value={todaysBookingsCount}
          subtext="Scheduled today"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Active Vehicles"
          value={activeVehiclesCount}
          subtext="Parked inside facility"
          icon={Car}
          color="purple"
        />
        <StatCard
          title="Available Slots"
          value={availableSlots}
          subtext={`out of ${totalSlots} total`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Occupied Slots"
          value={occupiedSlots}
          subtext="Bay utilization"
          icon={Car}
          color="rose"
        />
        <StatCard
          title="Upcoming Reservations"
          value={upcomingReservations.length}
          subtext="Confirmed passes"
          icon={Clock}
          color="cyan"
        />
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="underline hover:opacity-80">Dismiss</button>
        </div>
      )}

      {/* Terminal Tools & Active Occupants Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Operations Terminal Controls (Check-In, Check-Out, QR Scanner) */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
          
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'checkin'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              <span>Check-In Gate</span>
            </button>

            <button
              onClick={() => setActiveTab('checkout')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'checkout'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>Check-Out Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('qrscanner')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'qrscanner'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>QR Pass Scanner</span>
            </button>
          </div>

          {/* 1. Check-In Form */}
          {activeTab === 'checkin' && (
            <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">License Plate (ALPR Camera)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-AB-4021"
                  value={inputPlate}
                  onChange={(e) => setInputPlate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase font-bold text-sm tracking-wider focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Available Slot</label>
                <select
                  required
                  value={selectedSlotNum}
                  onChange={(e) => setSelectedSlotNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="">Select a free bay...</option>
                  {availableSlotList.map((s) => (
                    <option key={s.id} value={s.number}>
                      Slot {s.number} (Zone: {s.zoneId.toUpperCase()}) - ${s.price}/hr
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle Category</label>
                <select
                  value={vehicleCategory}
                  onChange={(e) => setVehicleCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Sedan">Sedan / Compact</option>
                  <option value="SUV">SUV / Crossover</option>
                  <option value="EV">⚡ EV Vehicle</option>
                  <option value="Van">Van / Light Truck</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Process Vehicle Check-In</span>
              </button>
            </form>
          )}

          {/* 2. Check-Out Form */}
          {activeTab === 'checkout' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Occupied Slot to Exit</label>
                <select
                  value={selectedSlotNum}
                  onChange={(e) => setSelectedSlotNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-rose-500"
                >
                  <option value="">Choose occupied bay...</option>
                  {occupiedSlotList.map((s) => (
                    <option key={s.id} value={s.number}>
                      Slot {s.number} - Vehicle: {s.occupiedBy || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={(e) => handleCheckOutSubmit(e, selectedSlotNum)}
                disabled={!selectedSlotNum}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Process Gate Exit & Settle Fee</span>
              </button>
            </div>
          )}

          {/* 3. QR Scanner Tool */}
          {activeTab === 'qrscanner' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleScanQR} className="space-y-3">
                <label className="block text-slate-300 font-semibold mb-1">Enter Booking ID or Scan Barcode String</label>
                <div className="relative">
                  <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK-9021 or FP-BK9021-A03..."
                    value={scanQuery}
                    onChange={(e) => setScanQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono uppercase font-bold text-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify Ticket Status</span>
                </button>
              </form>

              {qrResult && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  qrResult.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <h4 className="font-bold text-white">{qrResult.title}</h4>
                  <p>{qrResult.message}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right: Active Occupants List & Upcoming Reservations Summary */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-rose-400" />
              Active Occupants ({occupiedSlotList.length})
            </h3>
            <span className="text-xs text-slate-400">Live floor telemetry</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {occupiedSlotList.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                No vehicles currently parked inside facility.
              </div>
            ) : (
              occupiedSlotList.map((slot) => (
                <div key={slot.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between shadow-xs hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-black text-sm">
                      {slot.number}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-white text-sm tracking-wider">
                        {slot.occupiedBy || 'V-UNKNOWN'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {slot.vehicleType || 'Vehicle'} • Entry: {slot.entryTime ? new Date(slot.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckOutSubmit(null, slot.number)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Check Out</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default StaffDashboard;
