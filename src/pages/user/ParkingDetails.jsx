import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { INITIAL_LOCATIONS, fetchParkingLocationsDB } from '../../lib/supabase';
import SlotCard from '../../components/parking/SlotCard';
import BookingModal from '../../components/parking/BookingModal';
import TicketModal from '../../components/parking/TicketModal';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';
import { CardSkeleton } from '../../components/common/Skeleton';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Star, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  Eye,
  DollarSign,
  Accessibility,
  Building2,
  Info,
  Map,
  Sparkles,
  ChevronRight,
  Grid,
  Layers,
  AlertCircle
} from 'lucide-react';

const ParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { slots, updateSlotStatus, availableSlots, totalSlots } = useParking();

  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Interactive Reservation Widget State
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [departureTime, setDepartureTime] = useState('11:00');
  const [vehicleType, setVehicleType] = useState('Car');
  const [licensePlate, setLicensePlate] = useState('ABC-1234');

  // Active Floor Zone Filter on Page
  const [activeZone, setActiveZone] = useState('all');

  // Currently Selected Slot on Page
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectionAlert, setSelectionAlert] = useState('');

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Active Image Gallery Index
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Fetch Location Details
  useEffect(() => {
    const loadLocationDetails = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const remoteLocations = await fetchParkingLocationsDB();
        const allLocs = remoteLocations && remoteLocations.length > 0 ? remoteLocations : INITIAL_LOCATIONS;
        
        let found = allLocs.find(l => String(l.id) === String(id) || l.name.toLowerCase().includes(String(id).toLowerCase()));
        
        if (!found) {
          found = allLocs[0];
        }

        const galleryImages = [
          found.image || 'https://images.unsplash.com/photo-1506521782020-18925f46c2bf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
        ];

        setLocation({
          ...found,
          galleryImages,
          description: found.description || `${found.name} is a modern, state-of-the-art multi-level parking facility offering 24/7 automated gate entry, real-time bay telemetry, Level 3 EV fast charging stations, and round-the-clock security monitoring.`,
          openingHours: '24 Hours / 7 Days',
          headroom: "7' 2\" (2.18m)",
          distance: '0.4 miles away'
        });
      } catch (err) {
        setErrorMessage('Failed to load facility details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationDetails();
  }, [id]);

  // Duration & Price calculation helper
  const calculateDurationHours = () => {
    const [arrH, arrM] = arrivalTime.split(':').map(Number);
    const [depH, depM] = departureTime.split(':').map(Number);
    let startMin = arrH * 60 + arrM;
    let endMin = depH * 60 + depM;
    if (endMin <= startMin) endMin += 24 * 60;
    return Math.max(1, Math.ceil((endMin - startMin) / 60));
  };

  const durationHours = calculateDurationHours();
  const totalPrice = durationHours * (location?.pricePerHour || 8);

  // Slot Selection click handler enforcing available-only selection
  const handleSlotClick = (slot) => {
    setSelectionAlert('');
    if (slot.status !== 'available') {
      setSelectionAlert(`Slot ${slot.number} is currently ${slot.status.toUpperCase()} and cannot be selected. Please pick a green Available slot.`);
      return;
    }

    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleNavigateToSlotsPage = () => {
    const query = `?location=${encodeURIComponent(location?.name || 'Downtown Central Garage')}&date=${bookingDate}&start=${arrivalTime}&end=${departureTime}&vehicle=${vehicleType}`;
    navigate(`/parking/slots${query}`);
  };

  // Group slots into Floor Rows
  const filteredSlots = slots.filter(s => {
    if (activeZone === 'zone-a') return s.number.startsWith('A');
    if (activeZone === 'zone-b') return s.number.startsWith('B');
    if (activeZone === 'zone-c') return s.number.startsWith('C');
    return true;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <EmptyState
          icon="search"
          title="Parking Facility Not Found"
          description="The requested parking garage location could not be retrieved."
          actionText="Back to Find Parking"
          onAction={() => navigate('/user/find-parking')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Breadcrumbs & Header Bar */}
      <div className="space-y-3 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/user/find-parking" className="hover:text-white transition-colors">Find Parking</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-bold">{location.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> {location.openingHours}
              </span>
              <span className="text-xs text-slate-400 font-medium">{location.distance}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              {location.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{location.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1.5 rounded-2xl text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm">{location.rating}</span>
              <span className="text-slate-400 text-[10px]">(128 reviews)</span>
            </div>

            <button
              onClick={() => navigate('/user/find-parking')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <AlertBanner
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Main Grid: Gallery & Facility Info vs Sticky Reservation Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Gallery, Overview, Slot Selection Section, Map */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Image Gallery Showcase */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <img
                src={location.galleryImages[activeImageIdx]}
                alt={location.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-emerald-400">
                {location.availableSlots} Bays Available Now
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-3">
              {location.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative h-20 w-28 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImageIdx === idx ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE FLOOR MAP & BAY SELECTION SECTION (EMBEDDED DIRECTLY ON PAGE) */}
          {/* ========================================================================= */}
          <div id="slot-selection-section" className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  🟢 Supabase Realtime Telemetry Sync Active
                </span>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                  <Grid className="w-5 h-5 text-indigo-400" />
                  Interactive Floor Map & Bay Selection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any available green bay (🟢) below to pick your spot.
                </p>
              </div>

              <button
                onClick={handleNavigateToSlotsPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
              >
                <span>Full Floor Map View</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Strict Color Status Legend Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Legend:</span>
              <div className="flex flex-wrap items-center gap-2 font-semibold text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟢 Available</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white border border-blue-400 font-bold">🔵 Selected</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 opacity-80">🟡 Reserved</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 opacity-80">🔴 Occupied</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 opacity-60">⚪ Maintenance</span>
              </div>
            </div>

            {selectionAlert && (
              <AlertBanner
                type="error"
                message={selectionAlert}
                onClose={() => setSelectionAlert('')}
              />
            )}

            {/* Floor Zone Filter */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              {[
                { id: 'all', label: 'All Bays' },
                { id: 'zone-a', label: 'Row A (Standard)' },
                { id: 'zone-b', label: 'Row B (EV Charger)' },
                { id: 'zone-c', label: 'Row C (VIP Valet)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveZone(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeZone === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Visual Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredSlots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  isSelected={selectedSlot?.id === slot.id}
                  onSelectSlot={handleSlotClick}
                  onToggleMaintenance={(id, newStatus) => updateSlotStatus(id, newStatus)}
                />
              ))}
            </div>

          </div>

          {/* Facility Overview & Description */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" />
              Facility Overview & Specifications
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {location.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Opening Hours</span>
                <strong className="text-white font-bold">{location.openingHours}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Headroom Clearance</span>
                <strong className="text-white font-bold">{location.headroom}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Hourly Rate</span>
                <strong className="text-emerald-400 font-black text-sm">${location.pricePerHour}/hr</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Bays</span>
                <strong className="text-white font-bold">{location.totalSlots} Bays</strong>
              </div>
            </div>
          </div>

          {/* Security & Amenities Badges */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Amenities & Security Features
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(location.facilities || ['EV Charging', '24/7 Security', 'Covered Bays', 'Accessible Ramp']).map((fac, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Sticky Reservation Widget */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Standard Rate</span>
                <div className="text-3xl font-black text-white">
                  ${location.pricePerHour}<span className="text-xs font-normal text-slate-400"> / hr</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                {availableSlots} Bays Free
              </span>
            </div>

            {/* Selected Slot Highlight */}
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

            {/* Reservation Controls Form */}
            <div className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Select Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Arrival Time
                </label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Departure Time
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
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

              {/* Price Calculation Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Duration</span>
                  <strong className="text-white">{durationHours} Hours</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hourly Rate</span>
                  <strong className="text-white">${location.pricePerHour}.00</strong>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-sm font-black">
                  <span className="text-white">Estimated Total</span>
                  <span className="text-emerald-400 font-mono">${totalPrice}.00</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleNavigateToSlotsPage}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs transition-all"
                >
                  <Grid className="w-4 h-4 text-indigo-400" />
                  <span>Full Screen Floor Layout</span>
                </button>

                <button
                  onClick={() => {
                    if (!selectedSlot) {
                      const el = document.getElementById('slot-selection-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      setSelectionAlert('Please click an available 🟢 Green slot on the floor map to select it first.');
                      return;
                    }
                    navigate(`/user/booking-confirmation?slot=${selectedSlot.number}&location=${encodeURIComponent(location.name)}&date=${bookingDate}&start=${arrivalTime}&end=${departureTime}&vehicle=${vehicleType}&plate=${encodeURIComponent(licensePlate)}`, {
                      state: {
                        slot: selectedSlot,
                        slotNumber: selectedSlot.number,
                        locationName: location.name,
                        selectedDate: bookingDate,
                        startTime: arrivalTime,
                        endTime: departureTime,
                        vehicleType,
                        licensePlate
                      }
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-xl shadow-indigo-600/35 transition-all hover:scale-105"
                >
                  <span>Confirm & Book Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Booking Form Modal */}
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

      {/* Digital Pass Ticket Modal */}
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

export default ParkingDetails;
