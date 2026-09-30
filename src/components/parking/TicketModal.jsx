import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { QrCode, CheckCircle2, Printer, MapPin, Car, Calendar, Clock, DollarSign, ShieldCheck } from 'lucide-react';

const TicketModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const bookingDateStr = booking.startTime 
    ? new Date(booking.startTime).toLocaleDateString() 
    : new Date().toLocaleDateString();

  const startTimeStr = booking.startTime 
    ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '10:00 AM';

  const endTimeStr = booking.endTime 
    ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '12:00 PM';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure QR Booking Pass" maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        
        {/* Pass Ticket Banner */}
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/80 border border-indigo-500/30 p-5 shadow-2xl text-center space-y-4 overflow-hidden">
          
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Payment Authorized & Ticket Ready</span>
            <h4 className="text-xl font-black text-white tracking-wide mt-0.5">Booking Pass #{booking.id}</h4>
            <p className="text-[11px] text-slate-400">Present this QR barcode to Staff or ALPR Scanner at gate barrier</p>
          </div>

          {/* Secure Dynamic QR Code Graphic Box */}
          <div className="mx-auto w-48 h-48 rounded-2xl bg-white p-3 shadow-2xl flex flex-col items-center justify-center border-4 border-indigo-500/30 relative group">
            <QrCode className="w-36 h-36 text-slate-950" />
            <span className="text-[9px] font-mono text-slate-700 font-bold tracking-widest mt-1">
              {booking.qrCode || `FP-${booking.id}-${booking.slotNumber}`}
            </span>
          </div>

          {/* Details Table */}
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-2 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400">Booking ID:</span>
              <span className="font-mono font-bold text-indigo-400 text-sm">{booking.id}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Parking Location:</span>
              <span className="font-bold text-white text-right">Executive Floor Plaza</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Parking Slot:</span>
              <span className="text-base font-black text-emerald-400">Slot {booking.slotNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Vehicle Plate & Type:</span>
              <span className="font-mono font-bold text-amber-300">{booking.licensePlate} ({booking.vehicleType || 'Sedan'})</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Reservation Date:</span>
              <span className="text-slate-200 font-semibold">{bookingDateStr}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Time Range:</span>
              <span className="text-slate-200 font-semibold">{startTimeStr} - {endTimeStr} ({booking.hours} hrs)</span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-2">
              <span className="text-slate-400">Total Amount Paid:</span>
              <span className="text-emerald-400 font-black text-sm">${booking.totalPrice}.00</span>
            </div>
          </div>

        </div>

        {/* Print / Done Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Print Pass Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Done</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default TicketModal;
