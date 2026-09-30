import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import TicketModal from '../../components/parking/TicketModal';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { 
  Car, 
  Clock, 
  DollarSign, 
  CalendarCheck, 
  Navigation, 
  QrCode, 
  Bell, 
  ArrowRight, 
  Sparkles,
  Zap,
  Layers,
  CheckCircle2,
  Search,
  PlusCircle,
  CreditCard,
  History,
  User,
  XCircle,
  Filter,
  Check,
  Building2
} from 'lucide-react';

const UserDashboard = ({ activeDefaultTab = 'overview' }) => {
  const { user } = useAuth();
  const { 
    slots, 
    bookings, 
    availableSlots, 
    totalSlots, 
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    isLoadingDB 
  } = useParking();

  const navigate = useNavigate();

  // Active Tab State: overview | payments | history | notifications
  const [activeTab, setActiveTab] = useState(activeDefaultTab);

  // Search filter query in topbar
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Dynamic user-specific data from Supabase / Context state
  const userBookings = bookings.filter(b => 
    b.userEmail?.toLowerCase() === user?.email?.toLowerCase() || 
    b.userName?.toLowerCase() === user?.name?.toLowerCase()
  );

  const activeBooking = userBookings.find(b => b.status === 'Confirmed' || b.status === 'Checked-In' || b.status === 'Upcoming') || null;
  const totalBookingsCount = userBookings.length;
  const totalSpentAmount = userBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  // Filtered Bookings list based on topbar search query
  const filteredBookings = userBookings.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.id?.toLowerCase().includes(q) ||
      b.slotNumber?.toLowerCase().includes(q) ||
      b.licensePlate?.toLowerCase().includes(q) ||
      (b.parkingName || 'Downtown Central Garage').toLowerCase().includes(q)
    );
  });

  const recentBookingsList = filteredBookings.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* ========================================================================= */}
      {/* 1. TOPBAR & GREETING */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        
        {/* Welcome Greeting */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
              Driver Portal
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Welcome back, <span className="text-indigo-400">{user?.name || 'Driver'}</span> 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your parking reservations, active passes, vehicles, and payment receipts.
          </p>
        </div>

        {/* Topbar Controls: Quick Search Bar & Notification Bell */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Live Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings, slots, plates..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* User Profile Quick Tag */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DASHBOARD NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
          { id: 'history', label: 'Parking History', icon: History },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications?.filter(n => !n.read).length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. STATISTICS CARDS */}
      {/* ========================================================================= */}
      {isLoadingDB ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Slots"
            value={availableSlots}
            subtext={`out of ${totalSlots} total bays`}
            icon={Car}
            color="emerald"
            badgeText="Real-Time"
          />
          <StatCard
            title="Active Booking"
            value={activeBooking ? `Slot ${activeBooking.slotNumber}` : 'None'}
            subtext={activeBooking ? `${activeBooking.hours} Hours Reserved` : 'No active pass'}
            icon={Clock}
            color="indigo"
            badgeText={activeBooking ? activeBooking.status : 'Ready'}
          />
          <StatCard
            title="Total Bookings"
            value={totalBookingsCount}
            subtext="Reservations made"
            icon={CalendarCheck}
            color="purple"
          />
          <StatCard
            title="Total Spent"
            value={`$${totalSpentAmount}.00`}
            subtext="Cumulative booking spend"
            icon={DollarSign}
            color="cyan"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACTIVE BOOKING CARD */}
      {/* ========================================================================= */}
      {activeBooking && (
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-start gap-4 z-10">
            <div className="p-4 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <QrCode className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Parking Pass
                </span>
                <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-md font-mono font-bold">
                  {activeBooking.id}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activeBooking.parkingName || 'Downtown Central Garage'} • <span className="text-indigo-400">Slot {activeBooking.slotNumber}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Vehicle Plate</span>
                  <strong className="text-amber-300 font-mono">{activeBooking.licensePlate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Date</span>
                  <strong className="text-white">{new Date(activeBooking.createdAt || Date.now()).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Duration</span>
                  <strong className="text-white">{activeBooking.hours} Hours</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Status</span>
                  <Badge variant="confirmed">{activeBooking.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto z-10">
            <button
              onClick={() => {
                setSelectedTicket(activeBooking);
                setShowTicketModal(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-xl shadow-indigo-600/35 transition-all hover:scale-105 w-full lg:w-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>View QR Pass</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. QUICK ACTIONS */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button
            onClick={() => navigate('/user/find-parking')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Find Parking</h4>
                <p className="text-[10px] text-slate-400">Search location & available slots</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/user/find-parking')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Book a Slot</h4>
                <p className="text-[10px] text-slate-400">Instant reservation & digital pass</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/user/vehicles')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Add Vehicle</h4>
                <p className="text-[10px] text-slate-400">Manage your vehicle license plates</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MAIN CONTENT SECTION BY ACTIVE TAB */}
      {/* ========================================================================= */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Recent Bookings Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-400" />
                Recent Bookings ({filteredBookings.length})
              </h2>
              <Link to="/user/bookings" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBookingsList.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No Bookings Found"
                description={searchQuery ? `No reservations matching "${searchQuery}"` : "You haven't reserved any parking bays yet."}
                actionText="Book First Slot"
                onAction={() => navigate('/user/find-parking')}
              />
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Booking ID</th>
                      <th className="p-3.5">Parking</th>
                      <th className="p-3.5">Slot</th>
                      <th className="p-3.5">Plate</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">QR Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recentBookingsList.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-indigo-400">{b.id}</td>
                        <td className="p-3.5 font-bold text-white">{b.parkingName || 'Downtown Central'}</td>
                        <td className="p-3.5 font-black text-indigo-300">{b.slotNumber}</td>
                        <td className="p-3.5 font-mono font-bold text-amber-300">{b.licensePlate}</td>
                        <td className="p-3.5 font-bold text-emerald-400">${b.totalPrice}.00</td>
                        <td className="p-3.5">
                          <Badge variant={b.status.toLowerCase()}>{b.status}</Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedTicket(b);
                              setShowTicketModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors"
                            title="View Digital Pass"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Notifications Feed */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                Notifications Feed
              </h2>
              <button onClick={clearAllNotifications} className="text-xs text-slate-400 hover:text-rose-400 transition-colors">
                Clear All
              </button>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-xl max-h-[380px] overflow-y-auto pr-1">
              {notifications && notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      !n.read ? 'bg-slate-800/80 border-indigo-500/30' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-300">{n.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <div className="font-bold text-white">{n.title}</div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No notifications recorded.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Payment Transactions & Receipts
              </h3>
              <p className="text-xs text-slate-400 mt-1">Audit log of all payments and verified gateway transactions.</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
              Total Spent: ${totalSpentAmount}.00
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {userBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-indigo-400 font-bold">TXN-FP-{b.id}</td>
                    <td className="p-3.5 font-mono text-slate-300">{b.id}</td>
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Stripe / Card
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400">${b.totalPrice}.00</td>
                    <td className="p-3.5"><Badge variant="successful">Successful</Badge></td>
                    <td className="p-3.5 text-slate-400">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PARKING HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Complete Parking Reservation History
            </h3>
            <p className="text-xs text-slate-400 mt-1">Full archive of past and present parking pass receipts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBookings.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono font-bold text-indigo-400 text-xs">{b.id}</span>
                  <Badge variant={b.status.toLowerCase()}>{b.status}</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{b.parkingName || 'Downtown Central Garage'}</h4>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                    <span>Slot Number: <strong className="text-white">{b.slotNumber}</strong></span>
                    <span className="font-mono text-amber-300">{b.licensePlate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800/60">
                  <span className="text-emerald-400 font-bold">${b.totalPrice}.00</span>
                  <button
                    onClick={() => {
                      setSelectedTicket(b);
                      setShowTicketModal(true);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:underline"
                  >
                    View Ticket QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                Notification Center
              </h3>
              <p className="text-xs text-slate-400 mt-1">Real-time gate check-in alerts, payment receipts, and reminders.</p>
            </div>
            <button
              onClick={clearAllNotifications}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-xs font-semibold transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    !n.read ? 'bg-slate-800/80 border-indigo-500/30' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                      {n.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No notifications recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <TicketModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          booking={selectedTicket}
        />
      )}

    </div>
  );
};

export default UserDashboard;
