import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import AlertBanner from '../../components/common/AlertBanner';
import Badge from '../../components/common/Badge';
import { QrCode, Search, CheckCircle2, XCircle, Clock, ShieldAlert, ArrowDownRight, Car, Check } from 'lucide-react';

const StaffCheckIn = () => {
  const { bookings, slots, checkInVehicle } = useParking();

  const [inputCode, setInputCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerifyQR = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const query = inputCode.trim().toUpperCase();

    // Find booking matching code or QR code string
    const booking = bookings.find(b => 
      b.id.toUpperCase() === query || 
      (b.qrCode && b.qrCode.toUpperCase().includes(query)) ||
      b.licensePlate.toUpperCase() === query
    );

    // Rule 1: Check if Invalid / Not Found
    if (!booking) {
      setVerificationResult({
        status: 'invalid',
        title: '❌ Invalid Booking Code',
        message: `No active reservation record found for code "${query}". Verify ticket QR or license plate.`,
        booking: null
      });
      return;
    }

    // Rule 2: Check if Cancelled
    if (booking.status === 'Cancelled') {
      setVerificationResult({
        status: 'cancelled',
        title: '⛔ Booking Cancelled',
        message: `Reservation ${booking.id} was cancelled by driver. Barrier gate access denied.`,
        booking
      });
      return;
    }

    // Rule 3: Check if Already Used / Checked-In
    if (booking.status === 'Checked-In' || booking.status === 'Completed') {
      setVerificationResult({
        status: 'already_used',
        title: '⚠️ Ticket Already Used',
        message: `Pass ${booking.id} has already been scanned/used for entry. Single-use QR pass expired.`,
        booking
      });
      return;
    }

    // Rule 4: Check if Expired
    const now = new Date();
    const endTime = booking.endTime ? new Date(booking.endTime) : new Date(Date.now() + 7200000);

    if (endTime < now) {
      setVerificationResult({
        status: 'expired',
        title: '⏰ Reservation Expired',
        message: `Booking ${booking.id} time window expired on ${endTime.toLocaleTimeString()}.`,
        booking
      });
      return;
    }

    // Rule 5: Approved & Valid
    setVerificationResult({
      status: 'approved',
      title: '✅ QR Verified & Approved',
      message: `Pass ${booking.id} is VALID for Slot ${booking.slotNumber} • Vehicle: ${booking.licensePlate}`,
      booking
    });
  };

  const handleApproveEntry = () => {
    if (!verificationResult || !verificationResult.booking) return;

    const b = verificationResult.booking;
    const res = checkInVehicle(b.slotNumber, b.licensePlate, b.vehicleType);

    if (res.success) {
      setVerificationResult({
        status: 'checked_in',
        title: '🟢 Barrier Gate Opened!',
        message: `Vehicle ${b.licensePlate} successfully checked into Slot ${b.slotNumber}.`,
        booking: { ...b, status: 'Checked-In' }
      });
      setInputCode('');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-cyan-400" />
          Staff QR Verification & Barrier Access
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized Staff QR scanner tool to verify ticket validity and detect invalid, cancelled, or expired passes.
        </p>
      </div>

      {/* Verification Scanner Form */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Scan Barcode / Enter Pass ID</span>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/20 font-bold">
            ALPR Hardware Active
          </span>
        </div>

        <form onSubmit={handleVerifyQR} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Scan QR Code String or Enter Booking ID (e.g. BK-9021)</label>
            <div className="relative">
              <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Scan QR barcode or enter BK-9021 / NY-FAST-88..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white font-mono uppercase font-bold text-sm tracking-wider focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Verify Ticket Authenticity</span>
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result Feedback Card */}
      {verificationResult && (
        <div className={`rounded-2xl border p-6 space-y-4 shadow-2xl animate-in fade-in duration-200 ${
          verificationResult.status === 'approved' || verificationResult.status === 'checked_in'
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            : verificationResult.status === 'already_used'
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
        }`}>
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">{verificationResult.title}</h3>
            <Badge variant={verificationResult.status === 'approved' ? 'confirmed' : verificationResult.status}>
              {verificationResult.status.toUpperCase()}
            </Badge>
          </div>

          <p className="text-xs text-slate-200">{verificationResult.message}</p>

          {/* Booking Summary if found */}
          {verificationResult.booking && (
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Pass ID:</span>
                <span className="font-mono font-bold text-indigo-400">{verificationResult.booking.id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Assigned Slot:</span>
                <span className="font-black text-white text-sm">Slot {verificationResult.booking.slotNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Vehicle Plate:</span>
                <span className="font-mono font-bold text-amber-300">{verificationResult.booking.licensePlate}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Status:</span>
                <span>{verificationResult.booking.status}</span>
              </div>
            </div>
          )}

          {/* Action Button for Approved Gate Entry */}
          {verificationResult.status === 'approved' && (
            <button
              onClick={handleApproveEntry}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownRight className="w-5 h-5" />
              <span>Authorize & Open Gate Barrier</span>
            </button>
          )}

        </div>
      )}

    </div>
  );
};

export default StaffCheckIn;
