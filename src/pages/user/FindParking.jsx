import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { 
  INITIAL_LOCATIONS, 
  fetchParkingLocationsDB, 
  fetchParkingSlotsDB 
} from '../../lib/supabase';
import SlotCard from '../../components/parking/SlotCard';
import BookingModal from '../../components/parking/BookingModal';
import TicketModal from '../../components/parking/TicketModal';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';
import { CardSkeleton } from '../../components/common/Skeleton';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Star, 
  Zap, 
  CheckCircle2, 
  SlidersHorizontal, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  Compass,
  Map,
  Grid,
  DollarSign,
  Accessibility,
  Check,
  Layers,
  Info
} from 'lucide-react';

const FindParking = () => {
  const navigate = useNavigate();
  const { slots, updateSlotStatus } = useParking();

  // Search Inputs
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [departureTime, setDepartureTime] = useState('11:00');
  const [vehicleType, setVehicleType] = useState('Car');

  // Filter & Sort States
  const [maxPrice, setMaxPrice] = useState(25);
  const [minAvailableSlots, setMinAvailableSlots] = useState(0);
  const [filterEVOnly, setFilterEVOnly] = useState(false);
  const [filterDisabled, setFilterDisabled] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(true);
  const [sortBy, setSortBy] = useState('recommended'); // recommended | price | rating | distance | availability

  // Display View Mode: grid | map
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);

  // Locations State & Loading/Error
  const [locations, setLocations] = useState(() => {
    return INITIAL_LOCATIONS.map((loc, idx) => ({
      ...loc,
      distance: (0.3 + idx * 0.4).toFixed(1),
      isOpen: true,
      openHours: '24/7 Open',
      mapCoords: { x: 25 + idx * 25, y: 30 + (idx % 2) * 35 }
    }));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Selected location detail modal & slot booking views
  const [viewingLocation, setViewingLocation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Fetch Supabase Locations
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      try {
        const remoteLocations = await fetchParkingLocationsDB();
        if (remoteLocations && remoteLocations.length > 0) {
          setLocations(remoteLocations.map((loc, idx) => ({
            ...loc,
            distance: (0.3 + idx * 0.4).toFixed(1),
            isOpen: true,
            openHours: '24/7 Open',
            mapCoords: { x: 25 + idx * 22, y: 30 + (idx % 2) * 35 }
          })));
        }
      } catch (err) {
        setErrorMessage('Failed to load live parking locations from database.');
      } finally {
        setIsLoading(false);
      }
    };
    loadLocations();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const remoteLocations = await fetchParkingLocationsDB();
      if (remoteLocations && remoteLocations.length > 0) {
        setLocations(remoteLocations.map((loc, idx) => ({
          ...loc,
          distance: (0.3 + idx * 0.4).toFixed(1),
          isOpen: true,
          openHours: '24/7 Open',
          mapCoords: { x: 25 + idx * 22, y: 30 + (idx % 2) * 35 }
        })));
      }
    } catch (e) {
      setErrorMessage('Database sync failed. Using local cached data.');
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Location filtering logic
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = 
      loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      loc.address.toLowerCase().includes(locationSearch.toLowerCase()) ||
      (loc.city || '').toLowerCase().includes(locationSearch.toLowerCase());

    const matchesPrice = loc.pricePerHour <= maxPrice;
    const matchesMinSlots = loc.availableSlots >= minAvailableSlots;
    const matchesEV = !filterEVOnly || loc.facilities.some(f => f.toLowerCase().includes('ev'));
    const matchesDisabled = !filterDisabled || loc.facilities.some(f => f.toLowerCase().includes('accessible') || f.toLowerCase().includes('ramp'));
    const matchesOpenNow = !filterOpenNow || loc.isOpen;

    return matchesSearch && matchesPrice && matchesMinSlots && matchesEV && matchesDisabled && matchesOpenNow;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.pricePerHour - b.pricePerHour;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
    if (sortBy === 'availability') return b.availableSlots - a.availableSlots;
    return 0;
  });

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            Find Parking Locations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search nearby parking facilities by location, arrival/departure time, rates, and amenities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: Grid vs Map */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'map' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <AlertBanner
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
          onRetry={handleRefresh}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. SEARCH SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            Parking Search Parameters
          </h3>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
            Live Telemetry Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Location */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Location / City
            </label>
            <input
              type="text"
              placeholder="Downtown, Broadway, Midtown..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Arrival Time */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Arrival Time
            </label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Departure Time */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Departure Time
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Vehicle Category */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-indigo-400" /> Vehicle Category
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="Car">Sedan / Compact Car</option>
              <option value="SUV">SUV / Crossover</option>
              <option value="EV">⚡ Electric Vehicle (EV)</option>
              <option value="Bike">Motorcycle / Bike</option>
            </select>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Price Range Filter Slider */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Max Price:
            </span>
            <input
              type="range"
              min="5"
              max="30"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-28 sm:w-36 accent-indigo-500"
            />
            <span className="font-mono font-bold text-emerald-400">${maxPrice}/hr</span>
          </div>

          {/* Min Slots Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Min Open Slots:</span>
            <select
              value={minAvailableSlots}
              onChange={(e) => setMinAvailableSlots(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-white font-medium focus:outline-none"
            >
              <option value={0}>Any</option>
              <option value={5}>5+ Bays Free</option>
              <option value={10}>10+ Bays Free</option>
              <option value={20}>20+ Bays Free</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-white font-medium focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="price">Lowest Price ($/hr)</option>
              <option value="distance">Nearest Distance (mi)</option>
              <option value="rating">Highest Customer Rating (⭐)</option>
              <option value="availability">Most Available Bays</option>
            </select>
          </div>

        </div>

        {/* Feature Checkboxes / Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          
          <button
            onClick={() => setFilterEVOnly(!filterEVOnly)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
              filterEVOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>EV Charging Hubs</span>
          </button>

          <button
            onClick={() => setFilterDisabled(!filterDisabled)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
              filterDisabled
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5 text-indigo-400" />
            <span>Accessible / Disabled Parking</span>
          </button>

          <button
            onClick={() => setFilterOpenNow(!filterOpenNow)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
              filterOpenNow
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Open Now 24/7</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAP VIEW SECTION (READY FOR MAP API INTEGRATION) */}
      {/* ========================================================================= */}
      {viewMode === 'map' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-indigo-400" />
                Interactive Parking Location Map
              </h3>
              <p className="text-xs text-slate-400">Google Maps / Mapbox API Ready canvas</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Pins: {filteredLocations.length}</span>
          </div>

          {/* Interactive Simulated Map Canvas */}
          <div className="h-96 w-full rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center">
            
            {/* Map Grid Pattern background */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Map Pins for each parking location */}
            {filteredLocations.map((loc) => {
              const isSelected = selectedMapLocation?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedMapLocation(loc)}
                  style={{ left: `${loc.mapCoords.x}%`, top: `${loc.mapCoords.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl border transition-all duration-300 shadow-2xl flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-indigo-600 border-white text-white z-30 scale-110 shadow-indigo-600/50' 
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:scale-105 z-20'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-amber-300 fill-amber-300' : 'text-indigo-400'}`} />
                  <span className="text-xs font-black font-mono">${loc.pricePerHour}/hr</span>
                </button>
              );
            })}

            {/* Selected Map Pin Popup Preview */}
            {selectedMapLocation && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-2xl bg-slate-900 border border-indigo-500/50 shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedMapLocation.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-indigo-400" /> {selectedMapLocation.address}
                    </p>
                  </div>
                  <button onClick={() => setSelectedMapLocation(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                  <span className="text-emerald-400 font-bold">{selectedMapLocation.availableSlots} bays free</span>
                  <button
                    onClick={() => setViewingLocation(selectedMapLocation)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    View Parking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARKING CARDS SECTION & STATES (GRID VIEW) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found <strong className="text-white font-bold">{filteredLocations.length}</strong> parking facilities</span>
          <span>Targeting {selectedDate} ({arrivalTime} - {departureTime})</span>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredLocations.length === 0 ? (
          /* NO PARKING FOUND STATE */
          <EmptyState
            icon="search"
            title="No Parking Locations Found"
            description="No parking facilities match your search criteria, price range, or applied filters."
            actionText="Clear Search Filters"
            onAction={() => {
              setLocationSearch('');
              setMaxPrice(30);
              setMinAvailableSlots(0);
              setFilterEVOnly(false);
              setFilterDisabled(false);
            }}
          />
        ) : (
          /* SUCCESSFUL RESULTS STATE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLocations.map((loc) => {
              const defaultImage = 'https://images.unsplash.com/photo-1506521782020-18925f46c2bf?auto=format&fit=crop&w=600&q=80';
              return (
                <div 
                  key={loc.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
                >
                  
                  {/* Location Cover Photo Banner Header */}
                  <div>
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950">
                      <img
                        src={loc.image || defaultImage}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                      {/* Top Floating Badges: Open 24/7 & Rating */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Open 24/7
                        </span>

                        <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{loc.rating}</span>
                        </div>
                      </div>

                      {/* Distance Badge */}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-slate-950/90 backdrop-blur-xs text-[10px] text-slate-300 font-mono border border-slate-800">
                        📍 {loc.distance} mi away
                      </div>
                    </div>

                    {/* Location Name & Details */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                        {loc.name}
                      </h3>

                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{loc.address}</span>
                      </p>

                      {/* Facilities Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {loc.facilities.map((fac, idx) => (
                          <span key={idx} className="text-[10px] font-semibold bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Slots availability, price, and View / Book Buttons */}
                  <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">
                        <strong className="text-emerald-400 font-bold">{loc.availableSlots}</strong> of {loc.totalSlots} slots available
                      </div>
                      <div className="text-xl font-black text-white">
                        ${loc.pricePerHour}<span className="text-xs font-normal text-slate-400">/hr</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/parking/${loc.id}`)}
                        className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs transition-all hover:border-indigo-500/50"
                      >
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => navigate(`/parking/slots?location=${encodeURIComponent(loc.name)}`)}
                        className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. LOCATION DETAIL & SLOT MAP MODAL */}
      {/* ========================================================================= */}
      {viewingLocation && (
        <Modal 
          isOpen={!!viewingLocation} 
          onClose={() => setViewingLocation(null)} 
          title={`Parking Bays - ${viewingLocation.name}`} 
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs flex flex-wrap justify-between items-center gap-2 text-slate-300">
              <div>
                <span className="font-bold text-white block">{viewingLocation.name}</span>
                <span className="text-slate-400">{viewingLocation.address}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-black text-lg block">${viewingLocation.pricePerHour}/hr</span>
                <span className="text-[10px] text-slate-400">Verified Supabase Realtime</span>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Select any available parking bay (🟢 Green) to reserve for {selectedDate} ({arrivalTime} - {departureTime}):
            </div>

            {/* Interactive Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onSelectSlot={(s) => {
                    setSelectedSlot(s);
                    setViewingLocation(null);
                  }}
                  onToggleMaintenance={(id, newStatus) => updateSlotStatus(id, newStatus)}
                />
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Booking Form Modal */}
      {selectedSlot && (
        <BookingModal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          slot={selectedSlot}
          onBookingSuccess={(b) => {
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

export default FindParking;
