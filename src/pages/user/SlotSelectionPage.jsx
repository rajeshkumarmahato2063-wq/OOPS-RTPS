import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import SlotCard from '../../components/parking/SlotCard';
import BookingModal from '../../components/parking/BookingModal';
import TicketModal from '../../components/parking/TicketModal';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';
import Badge from '../../components/common/Badge';
import { 
  Grid, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  QrCode,
  Sparkles,
  Info,
  DollarSign,
  Layers,
  ArrowLeft
} from 'lucide-react';

const SlotSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { slots, updateSlotStatus, availableSlots, occupiedSlots, totalSlots } = useParking();

  // Active Floor / Zone Filter: all | zone-a | zone-b | zone-c
  const [activeZone, setActiveZone] = useState('all');

  // Currently Selected Slot
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Reservation Parameters
  const locationName = searchParams.get('location') || 'Downtown Central Garage';
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [vehicleType, setVehicleType] = useState('Car');
  const [licensePlate, setLicensePlate] = useState('ABC-1234');

  // Feedback Banner Error / Alert
  const [selectionError, setSelectionError] = useState('');

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Calculate duration & price
  const calculateDurationHours = () => {
    const [arrH, arrM] = startTime.split(':').map(Number);
    const [depH, depM] = endTime.split(':').map(Number);
    let startMin = arrH * 60 + arrM;
    let endMin = depH * 60 + depM;
    if (endMin <= startMin) endMin += 24 * 60;
    return Math.max(1, Math.ceil((endMin - startMin) / 60));
  };

  const durationHours = calculateDurationHours();
  const slotRate = selectedSlot?.price || 8;
  const estimatedPrice = durationHours * slotRate;

  // Handle slot click with strict enforcement
  const handleSlotSelect = (slot) => {
    setSelectionError('');
    if (slot.status !== 'available') {
      setSelectionError(`Slot ${slot.number} is currently ${slot.status.toUpperCase()} and cannot be selected. Please pick a green Available slot.`);
      return;
    }

    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null); // Unselect if clicked again
    } else {
      setSelectedSlot(slot);
    }
  };

  // Group slots by Floor Rows (Row A, Row B, Row C)
  const filteredSlots = slots.filter(s => {
    if (activeZone === 'zone-a') return s.number.startsWith('A');
    if (activeZone === 'zone-b') return s.number.startsWith('B');
    if (activeZone === 'zone-c') return s.number.startsWith('C');
    return true;
  });

  const rowA = filteredSlots.filter(s => s.number.startsWith('A'));
  const rowB = filteredSlots.filter(s => s.number.startsWith('B'));
  const rowC = filteredSlots.filter(s => s.number.startsWith('C'));

  const handleConfirmSlot = () => {
    if (!selectedSlot) {
      setSelectionError('Please click an available parking bay (🟢 Green) on the floor map to select it first.');
      return;
    }
    navigate(`/user/booking-confirmation?slot=${selectedSlot.number}&location=${encodeURIComponent(locationName)}&date=${selectedDate}&start=${startTime}&end=${endTime}&vehicle=${vehicleType}&plate=${encodeURIComponent(licensePlate)}`, {
      state: {
        slot: selectedSlot,
        slotNumber: selectedSlot.number,
        locationName,
        selectedDate,
        startTime,
        endTime,
        vehicleType,
        licensePlate
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header & Status Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <button
            onClick={() => navigate('/user/find-parking')}
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-2 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Parking Search
          </button>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Grid className="w-6 h-6 text-indigo-400" />
            Real-Time Parking Slot Selection
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual floor layout for <strong className="text-white">{locationName}</strong>. Select any open bay to reserve.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {availableSlots} of {totalSlots} Bays Free
          </span>
        </div>
      </div>

      {/* Strict Color Status Legend Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Slot Status Legend:</span>
        <div className="flex flex-wrap items-center gap-3 font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> 🟢 Available
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white border border-blue-400 flex items-center gap-1.5 font-bold shadow-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse"></span> 🔵 Selected
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 opacity-80">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span> 🟡 Reserved
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 opacity-80">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> 🔴 Occupied
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 opacity-60">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span> ⚪ Maintenance
          </span>
        </div>
      </div>

      {selectionError && (
        <AlertBanner
          type="error"
          message={selectionError}
          onClose={() => setSelectionError('')}
        />
      )}

      {/* Main Grid: Visual Floor Map (8 cols) vs Booking Summary Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Interactive Floor Layout */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Floor / Zone Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'all', label: 'All Floor Levels' },
              { id: 'zone-a', label: 'Level 1 (Row A - Standard & Accessible)' },
              { id: 'zone-b', label: 'Level 2 (Row B - EV Fast Charge)' },
              { id: 'zone-c', label: 'Level 3 (Row C - Executive VIP)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveZone(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeZone === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row A Section */}
          {(activeZone === 'all' || activeZone === 'zone-a') && rowA.length > 0 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Level 1 • Row A (Standard & Accessible Bays)
                </h3>
                <span className="text-xs text-slate-400 font-mono">5 Bays</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rowA.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot?.id === slot.id}
                    onSelectSlot={handleSlotSelect}
                    onToggleMaintenance={(id, newStatus) => updateSlotStatus(id, newStatus)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row B Section */}
          {(activeZone === 'all' || activeZone === 'zone-b') && rowB.length > 0 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Level 2 • Row B (EV Fast Charge Hubs)
                </h3>
                <span className="text-xs text-slate-400 font-mono">5 Bays</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rowB.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot?.id === slot.id}
                    onSelectSlot={handleSlotSelect}
                    onToggleMaintenance={(id, newStatus) => updateSlotStatus(id, newStatus)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row C Section */}
          {(activeZone === 'all' || activeZone === 'zone-c') && rowC.length > 0 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Level 3 • Row C (Executive VIP Valet Bays)
                </h3>
                <span className="text-xs text-slate-400 font-mono">5 Bays</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rowC.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot?.id === slot.id}
                    onSelectSlot={handleSlotSelect}
                    onToggleMaintenance={(id, newStatus) => updateSlotStatus(id, newStatus)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4 cols): Sticky Live Booking Summary Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 shadow-2xl space-y-5">
            
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                Booking Summary
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time reservation details</p>
            </div>

            {/* Selected Slot Highlight Box */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedSlot 
                ? 'bg-blue-950/50 border-blue-500/50 shadow-xl shadow-blue-500/10' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Selected Slot</span>
              {selectedSlot ? (
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <span className="text-2xl font-black text-white">Slot {selectedSlot.number}</span>
                    <span className="text-xs text-indigo-300 block font-semibold capitalize">{selectedSlot.type} Bay</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-400">
                    🔵 Selected
                  </span>
                </div>
              ) : (
                <div className="text-xs text-amber-300 font-semibold mt-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Click an available 🟢 Green slot on the floor map to select it</span>
                </div>
              )}
            </div>

            {/* Reservation Summary Attributes */}
            <div className="space-y-3.5 text-xs">
              
              <div>
                <span className="text-slate-400 text-[10px] block">Parking Facility</span>
                <strong className="text-white font-bold text-sm">{locationName}</strong>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-indigo-400" /> Vehicle Category & License Plate
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Car">Sedan / Car</option>
                    <option value="SUV">SUV / Truck</option>
                    <option value="EV">EV Charging</option>
                    <option value="Bike">Motorcycle</option>
                  </select>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="Plate #"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold uppercase focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Duration</span>
                  <strong className="text-white">{durationHours} Hours</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hourly Rate</span>
                  <strong className="text-white">${slotRate}.00 / hr</strong>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-sm font-black">
                  <span className="text-white">Total Amount</span>
                  <span className="text-emerald-400 font-mono">${estimatedPrice}.00</span>
                </div>
              </div>

              {/* Confirm Slot Button */}
              <button
                onClick={handleConfirmSlot}
                disabled={!selectedSlot}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs shadow-xl transition-all ${
                  selectedSlot
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/35 hover:scale-105 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>Confirm Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>

      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          slot={selectedSlot}
          onBookingSuccess={(b) => {
            setShowBookingModal(false);
            setActiveBooking(b);
            setShowTicketModal(true);
          }}
        />
      )}

      {/* Ticket Modal */}
      {showTicketModal && activeBooking && (
        <TicketModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          booking={activeBooking}
        />
      )}

    </div>
  );
};

export default SlotSelectionPage;
