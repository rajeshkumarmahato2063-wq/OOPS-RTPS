import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import { fetchVehiclesDB, INITIAL_VEHICLES } from '../../lib/supabase';
import { Car, Clock, Calendar, CreditCard, ShieldCheck, Zap, AlertCircle, CheckCircle2, ChevronRight, Lock } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, slot, onBookingSuccess }) => {
  const { user } = useAuth();
  const { createBooking, bookings } = useParking();

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State Flow
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [licensePlate, setLicensePlate] = useState(user?.vehicle || 'NY-FAST-88');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [savedVehicles, setSavedVehicles] = useState(INITIAL_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's saved vehicles for vehicle selection
  useEffect(() => {
    fetchVehiclesDB().then(res => {
      if (res && res.length > 0) {
        setSavedVehicles(res);
        const def = res.find(v => v.isDefault) || res[0];
        if (def) {
          setSelectedVehicleId(def.id);
          setLicensePlate(def.licensePlate);
          setVehicleType(def.vehicleType || 'Sedan');
        }
      }
    });
  }, []);

  if (!slot) return null;

  // Validation logic for past dates, unavailable slots, and time ranges
  const calculateDurationAndPrice = () => {
    const rate = slot.price || 10;
    const startHour = parseInt(startTime.split(':')[0], 10) + parseInt(startTime.split(':')[1], 10) / 60;
    const endHour = parseInt(endTime.split(':')[0], 10) + parseInt(endTime.split(':')[1], 10) / 60;
    
    let durationHours = endHour - startHour;
    if (durationHours <= 0) durationHours = 1;

    const basePrice = durationHours * rate;
    const evSurcharge = slot.type === 'ev' ? 5 : 0;
    const totalPrice = basePrice + evSurcharge;

    return { durationHours: Math.round(durationHours * 10) / 10, rate, evSurcharge, totalPrice };
  };

  const { durationHours, rate, evSurcharge, totalPrice } = calculateDurationAndPrice();

  const handleVehicleSelect = (id) => {
    setSelectedVehicleId(id);
    const found = savedVehicles.find(v => v.id === id);
    if (found) {
      setLicensePlate(found.licensePlate);
      setVehicleType(found.vehicleType || 'Sedan');
    }
  };

  const validateBooking = () => {
    // 1. Prevent unavailable slots
    if (slot.status !== 'available') {
      setValidationError(`Slot ${slot.number} is currently ${slot.status.toUpperCase()} and cannot be reserved.`);
      return false;
    }

    // 2. Prevent past dates
    if (bookingDate < todayStr) {
      setValidationError('Past dates are not allowed for reservations. Please select today or a future date.');
      return false;
    }

    // 3. Prevent invalid time ranges
    const startHour = parseInt(startTime.split(':')[0], 10) + parseInt(startTime.split(':')[1], 10) / 60;
    const endHour = parseInt(endTime.split(':')[0], 10) + parseInt(endTime.split(':')[1], 10) / 60;

    if (endHour <= startHour) {
      setValidationError('Invalid Time Range: End Time must be strictly after Start Time.');
      return false;
    }

    // 4. Prevent overlapping bookings for same slot
    const hasOverlap = bookings.some(b => {
      if (b.slotNumber === slot.number && (b.status === 'Confirmed' || b.status === 'Checked-In')) {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        const reqStart = new Date(`${bookingDate}T${startTime}:00`);
        const reqEnd = new Date(`${bookingDate}T${endTime}:00`);
        return (reqStart < bEnd && reqEnd > bStart);
      }
      return false;
    });

    if (hasOverlap) {
      setValidationError(`Overlapping Booking Detected! Slot ${slot.number} is already reserved for this time range.`);
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateBooking()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Unique Booking ID Generation
      const uniqueBookingId = 'BK-' + Math.floor(1000 + Math.random() * 9000);
      const reqStart = new Date(`${bookingDate}T${startTime}:00`).toISOString();
      const reqEnd = new Date(`${bookingDate}T${endTime}:00`).toISOString();

      const newBooking = createBooking({
        id: uniqueBookingId,
        userEmail: user?.email || 'driver@fastparking.com',
        userName: user?.name || 'Fast Driver',
        slotNumber: slot.number,
        licensePlate: licensePlate.toUpperCase().trim(),
        vehicleType,
        startTime: reqStart,
        endTime: reqEnd,
        hours: durationHours,
        totalPrice
      });

      setIsSubmitting(false);

      if (newBooking) {
        onClose();
        onBookingSuccess(newBooking);
      }
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Parking Reservation" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {validationError && (
          <AlertBanner
            type="error"
            message={validationError}
            onClose={() => setValidationError('')}
          />
        )}

        {/* Step 1 & 2: Select Parking & Slot Summary */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Target Location & Bay</span>
            <span className="text-emerald-400 font-bold">🟢 Slot Available</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-black text-white">Slot {slot.number}</div>
              <div className="text-[11px] text-indigo-400 font-semibold capitalize">{slot.type} Parking Bay</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400">Hourly Rate</div>
              <div className="text-base font-bold text-emerald-400">${rate}/hr</div>
            </div>
          </div>
        </div>

        {/* Step 3: Select Vehicle */}
        <div className="space-y-2">
          <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
            <Car className="w-4 h-4 text-indigo-400" /> Step 3: Select Registered Vehicle
          </label>
          
          {savedVehicles.length > 0 && (
            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden focus:border-indigo-500 mb-2"
            >
              {savedVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} - {v.brand} {v.model} ({v.vehicleType})
                </option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Vehicle License Plate *</label>
              <input
                type="text"
                required
                placeholder="e.g. NY-FAST-88"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold text-sm tracking-wider focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Vehicle Category *</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Sedan">Sedan / Compact</option>
                <option value="SUV">SUV / Crossover</option>
                <option value="EV SUV">⚡ Electric Vehicle (EV)</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Truck">Van / Light Truck</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 4 & 5: Date, Start Time & End Time */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" /> Steps 4 & 5: Reservation Date & Time Range
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Date (No Past Dates) *</label>
              <input
                type="date"
                min={todayStr}
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Step 6: Secure Price Calculation */}
        <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/30 p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
            <span>Step 6: Price Breakdown</span>
            <span>Duration: {durationHours} hrs</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Hourly Rate (${rate}/hr × {durationHours} hrs):</span>
            <span>${(durationHours * rate).toFixed(2)}</span>
          </div>

          {evSurcharge > 0 && (
            <div className="flex justify-between text-teal-300">
              <span>EV Fast Charging Surcharge:</span>
              <span>+${evSurcharge}.00</span>
            </div>
          )}

          <div className="flex justify-between text-slate-300">
            <span>Gate ALPR Barrier Fee:</span>
            <span className="text-emerald-400 font-bold">FREE</span>
          </div>

          <div className="border-t border-indigo-500/30 pt-2 flex justify-between items-center text-sm font-bold text-white">
            <span>Total Payable Amount:</span>
            <span className="text-2xl text-emerald-400 font-black">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Step 7: Confirm Booking */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Creating Reservation & Locking Slot...</span>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Step 7: Confirm & Pay ${totalPrice.toFixed(2)}</span>
            </>
          )}
        </button>

      </form>
    </Modal>
  );
};

export default BookingModal;
