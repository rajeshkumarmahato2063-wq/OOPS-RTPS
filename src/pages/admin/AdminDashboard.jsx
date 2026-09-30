import React, { useState } from 'react';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Grid, 
  TrendingUp, 
  Layers, 
  Activity, 
  Zap, 
  MapPin, 
  Calendar, 
  CreditCard, 
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, usersList, updateUserRole, deleteUser } = useAuth();
  const { 
    slots, 
    zones, 
    bookings, 
    totalSlots, 
    occupiedSlots, 
    availableSlots, 
    reservedSlots,
    maintenanceSlots,
    occupancyRate, 
    totalRevenue,
    activityLogs,
    addSlot,
    deleteSlot,
    addZone,
    deleteZone
  } = useParking();

  // Management Tab State: overview | users | staff | locations | slots | bookings | payments | pricing
  const [activeTab, setActiveTab] = useState('overview');

  // Today's calculation metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysBookings = (bookings || []).filter(b => {
    if (!b) return false;
    try {
      const dateVal = b.startTime || b.createdAt;
      if (!dateVal) return true;
      const parsed = new Date(dateVal);
      if (isNaN(parsed.getTime())) return true;
      return parsed.toISOString().split('T')[0] === todayStr;
    } catch (e) {
      return true;
    }
  });
  const todaysBookingsCount = todaysBookings.length;
  const todaysRevenue = todaysBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  // Filtered Lists for management views
  const staffUsers = usersList.filter(u => u.role === 'staff');
  const regularUsers = usersList.filter(u => u.role === 'user');

  // Pricing rules state
  const [pricingRules, setPricingRules] = useState([
    { id: 1, type: 'Standard Car', baseRate: 8, peakRate: 12, weekendRate: 10, evSurcharge: 0 },
    { id: 2, type: 'EV Fast Charging', baseRate: 15, peakRate: 20, weekendRate: 18, evSurcharge: 5 },
    { id: 3, type: 'VIP Executive', baseRate: 15, peakRate: 25, weekendRate: 20, evSurcharge: 0 },
    { id: 4, type: 'Accessible Ramp', baseRate: 10, peakRate: 12, weekendRate: 10, evSurcharge: 0 },
  ]);

  return (
    <div className="space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            System Administration & Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Admin: <strong className="text-purple-300">{user?.name || 'Administrator'}</strong> • Real-time Supabase Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            System Status: 100% Operational
          </span>
        </div>
      </div>

      {/* 7 Required Metrics Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard
          title="Total Users"
          value={usersList.length}
          subtext="Accounts registered"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Locations"
          value={zones.length}
          subtext="Managed floors"
          icon={MapPin}
          color="cyan"
        />
        <StatCard
          title="Total Slots"
          value={totalSlots}
          subtext="Capacity defined"
          icon={Grid}
          color="indigo"
        />
        <StatCard
          title="Available Slots"
          value={availableSlots}
          subtext="Ready for booking"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Occupied Slots"
          value={occupiedSlots}
          subtext="Bays in use"
          icon={Layers}
          color="rose"
        />
        <StatCard
          title="Today's Bookings"
          value={todaysBookingsCount}
          subtext="Passes generated"
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${todaysRevenue}.00`}
          subtext="Gross earnings today"
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Navigation Sub-Tabs for Management Pages */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Analytics & Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Users ({regularUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'staff'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Staff Operators ({staffUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'locations'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Parking Locations ({zones.length})
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'slots'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Slots Setup ({slots.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'bookings'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Payments ($)
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-3.5 py-2 rounded-xl border transition-all ${
            activeTab === 'pricing'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Pricing Rules
        </button>
      </div>

      {/* 1. Overview Tab: Visual Capacity Bar & Revenue Trend Charts */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Capacity Progress Bar Chart */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Live Capacity & Slot Distribution Chart
              </h3>
              <span className="text-xs text-slate-400 font-mono">{occupancyRate}% Occupancy Rate</span>
            </div>

            <div className="space-y-4">
              <div className="h-6 w-full rounded-full bg-slate-950 p-1 flex overflow-hidden border border-slate-800">
                <div style={{ width: `${(occupiedSlots / totalSlots) * 100}%` }} className="bg-rose-500 rounded-l-full transition-all duration-500" title="Occupied" />
                <div style={{ width: `${(reservedSlots / totalSlots) * 100}%` }} className="bg-amber-400 transition-all duration-500" title="Reserved" />
                <div style={{ width: `${(maintenanceSlots / totalSlots) * 100}%` }} className="bg-slate-600 transition-all duration-500" title="Maintenance" />
                <div style={{ width: `${(availableSlots / totalSlots) * 100}%` }} className="bg-emerald-500 rounded-r-full transition-all duration-500" title="Available" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <div className="font-bold text-base">{availableSlots}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Available</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <div className="font-bold text-base">{occupiedSlots}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Occupied</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <div className="font-bold text-base">{reservedSlots}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Reserved</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  <div className="font-bold text-base">{maintenanceSlots}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Maintenance</div>
                </div>
              </div>
            </div>

            {/* Revenue Trend Visualizer */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hourly Revenue Trend Chart</h4>
              <div className="h-32 bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-end justify-between gap-2">
                {[45, 60, 80, 110, 95, 140, 180, 220, 190, 250, 310, 280].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div 
                      style={{ height: `${(val / 350) * 100}%` }} 
                      className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-md group-hover:from-indigo-500 group-hover:to-cyan-300 transition-all"
                    />
                    <span className="text-[9px] text-slate-500 font-mono">{idx * 2}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Logs Telemetry */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              Live Telemetry & Activity Audit Logs
            </h3>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <p className="text-slate-200 font-medium">{log.text}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. Users Management Page */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> Registered Drivers & Users ({regularUsers.length})
          </h2>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Plate</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {regularUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-white">{u.name}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-300">{u.vehicle || 'N/A'}</td>
                    <td className="p-3.5"><Badge variant="user">Driver</Badge></td>
                    <td className="p-3.5 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                      >
                        <option value="user">User (Driver)</option>
                        <option value="staff">Grant Staff</option>
                        <option value="admin">Grant Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Staff Management Page */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" /> Gate Staff Operators ({staffUsers.length})
          </h2>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Staff Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Badge No.</th>
                  <th className="p-3.5">Access Scope</th>
                  <th className="p-3.5 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-white">{u.name}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3.5 font-mono font-bold text-cyan-300">{u.badgeNumber || 'ST-402'}</td>
                    <td className="p-3.5"><Badge variant="staff">Gate Control</Badge></td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => updateUserRole(u.id, 'user')} className="text-rose-400 hover:underline">Revoke Staff</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Parking Locations Management Page */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> Facility Floors & Locations ({zones.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((z) => (
              <div key={z.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-purple-400">{z.floor}</span>
                  <span className="text-emerald-400 font-bold">${z.ratePerHour}/hr</span>
                </div>
                <h3 className="text-base font-black text-white">{z.name}</h3>
                <p className="text-xs text-slate-400">{z.description}</p>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-xs text-slate-500">
                  <span>Capacity: {z.maxSlots || 12} Bays</span>
                  <span>ALPR Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Slots Management Page */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-400" /> Configured Slots ({slots.length})
          </h2>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Slot Number</th>
                  <th className="p-3.5">Bay Type</th>
                  <th className="p-3.5">Hourly Rate</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {slots.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-black text-white font-mono">{s.number}</td>
                    <td className="p-3.5 capitalize font-semibold text-indigo-300">{s.type}</td>
                    <td className="p-3.5 font-bold text-emerald-400">${s.price}/hr</td>
                    <td className="p-3.5"><Badge variant={s.status}>{s.status}</Badge></td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => deleteSlot(s.id)} className="text-rose-400 hover:underline"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Bookings Management Page */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Customer Reservations ({bookings.length})
          </h2>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Pass ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Slot</th>
                  <th className="p-3.5">Plate</th>
                  <th className="p-3.5">Paid</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-indigo-400">{b.id}</td>
                    <td className="p-3.5 text-white font-bold">{b.userName}</td>
                    <td className="p-3.5 font-bold text-slate-200">{b.slotNumber}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-300">{b.licensePlate}</td>
                    <td className="p-3.5 font-bold text-emerald-400">${b.totalPrice}.00</td>
                    <td className="p-3.5"><Badge variant={b.status.toLowerCase()}>{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Payments & Transactions Page */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Payment Transactions Audit Log
          </h2>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">TXN Reference</th>
                  <th className="p-3.5">Pass ID</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Amount Authorized</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-purple-400">TXN-{Math.floor(10000000 + idx * 8492)}</td>
                    <td className="p-3.5 font-mono font-bold text-indigo-400">{b.id}</td>
                    <td className="p-3.5 text-slate-300">CREDIT CARD (SSL)</td>
                    <td className="p-3.5 font-black text-emerald-400">${b.totalPrice}.00</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">VERIFIED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Pricing Rules Page */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" /> Dynamic Pricing Rules Setup
          </h2>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Bay Type</th>
                  <th className="p-3.5">Base Rate ($/hr)</th>
                  <th className="p-3.5">Peak Rate ($/hr)</th>
                  <th className="p-3.5">Weekend Rate ($/hr)</th>
                  <th className="p-3.5">EV Fast Surcharge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pricingRules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-white">{r.type}</td>
                    <td className="p-3.5 font-bold text-emerald-400">${r.baseRate}/hr</td>
                    <td className="p-3.5 font-bold text-amber-400">${r.peakRate}/hr</td>
                    <td className="p-3.5 font-bold text-indigo-400">${r.weekendRate}/hr</td>
                    <td className="p-3.5 font-bold text-teal-300">+${r.evSurcharge}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
