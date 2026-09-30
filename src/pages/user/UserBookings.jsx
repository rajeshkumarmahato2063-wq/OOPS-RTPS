import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import TicketModal from '../../components/parking/TicketModal';
import { CalendarCheck, QrCode, XCircle, Clock, CheckCircle } from 'lucide-react';

const UserBookings = () => {
  const { user } = useAuth();
  const { bookings, cancelBooking } = useParking();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTicket, setShowTicket] = useState(false);

  const myBookings = bookings.filter(b => b.userEmail === user?.email || b.userName === user?.name);

  return (
    <div className="space-y-6">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-indigo-400" />
          My Reservations & Tickets
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          View active parking passes, receipt histories, or cancel upcoming reservations.
        </p>
      </div>

      {myBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No active bookings found</h3>
          <p className="text-xs text-slate-400 mt-1">Head over to the main dashboard to reserve a parking bay.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBookings.map((b) => (
            <div key={b.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pass ID</span>
                  <div className="text-base font-black text-indigo-400 font-mono">{b.id}</div>
                </div>
                <Badge variant={b.status.toLowerCase()}>{b.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Slot Number:</span>
                  <div className="font-extrabold text-white text-base">{b.slotNumber}</div>
                </div>
                <div>
                  <span className="text-slate-400">License Plate:</span>
                  <div className="font-mono font-bold text-amber-300">{b.licensePlate}</div>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>
                  <div className="text-slate-200">{b.hours} Hours</div>
                </div>
                <div>
                  <span className="text-slate-400">Total Paid:</span>
                  <div className="font-bold text-emerald-400">${b.totalPrice}.00</div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
                <button
                  onClick={() => {
                    setSelectedBooking(b);
                    setShowTicket(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Pass</span>
                </button>

                {b.status === 'Confirmed' && (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
                    title="Cancel Booking"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {showTicket && selectedBooking && (
        <TicketModal
          isOpen={showTicket}
          onClose={() => setShowTicket(false)}
          booking={selectedBooking}
        />
      )}

    </div>
  );
};

export default UserBookings;
