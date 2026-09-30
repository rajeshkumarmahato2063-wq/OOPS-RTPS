import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import { fetchParkingLocationsDB, INITIAL_LOCATIONS, fetchVehiclesDB, INITIAL_VEHICLES } from '../../lib/supabase';
import AlertBanner from '../../components/common/AlertBanner';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  Sparkles, 
  QrCode, 
  Lock, 
  ChevronRight, 
  Check,
  RefreshCw
} from 'lucide-react';

const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { slots, bookings, createBooking } = useParking();

  // Route state or URL search parameters
  const stateData = location.state || {};

  const initialSlotNum = stateData.slotNumber || stateData.slot?.number || searchParams.get('slot') || 'A-01';
  const initialLocName = stateData.locationName || searchParams.get('location') || 'Executive Floor & City Center Plaza';
  const initialDate = stateData.selectedDate || searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialStart = stateData.startTime || searchParams.get('start') || '09:00';
  const initialEnd = stateData.endTime || searchParams.get('end') || '11:00';
  const initialVehicleType = stateData.vehicleType || searchParams.get('vehicle') || 'Car';
  const initialPlate = stateData.licensePlate || searchParams.get('plate') || user?.vehicle || 'NY-FAST-88';

  // State Management
  const [parkingLocation, setParkingLocation] = useState({
    name: initialLocName,
    address: '100 Broadway Ave, Midtown, NY',
    pricePerHour: 12
  });

  const [slotNumber, setSlotNumber] = useState(initialSlotNum);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);
  const [vehicleType, setVehicleType] = useState(initialVehicleType);
  const [licensePlate, setLicensePlate] = useState(initialPlate);

  const [savedVehicles, setSavedVehicles] = useState(INITIAL_VEHICLES);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Resolve target slot object from slots context
  const selectedSlot = slots.find(s => s.number === slotNumber) || {
    id: slotNumber,
    number: slotNumber,
    type: 'standard',
    status: 'available',
    price: parkingLocation.pricePerHour
  };

  // Fetch real location details and registered vehicles from database
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const dbLocs = await fetchParkingLocationsDB();
        const allLocs = dbLocs && dbLocs.length > 0 ? dbLocs : INITIAL_LOCATIONS;
        const found = allLocs.find(l => 
          l.name.toLowerCase().includes(initialLocName.toLowerCase()) || 
          initialLocName.toLowerCase().includes(l.name.toLowerCase())
        ) || allLocs[0];

        if (found) {
          setParkingLocation({
            name: found.name,
            address: found.address,
            pricePerHour: found.pricePerHour || 12
          });
        }

        const dbVehicles = await fetchVehiclesDB();
        if (dbVehicles && dbVehicles.length > 0) {
          setSavedVehicles(dbVehicles);
        }
      } catch (err) {
        console.warn('Failed to load database location details:', err);
      }
    };

    loadDetails();
  }, [initialLocName]);

  // Secure Price Calculation Logic
  const calculateDurationAndPrice = () => {
    const hourlyRate = selectedSlot.price || parkingLocation.pricePerHour || 12;
    
    const [arrH, arrM] = startTime.split(':').map(Number);
    const [depH, depM] = endTime.split(':').map(Number);

    let startMin = (arrH || 9) * 60 + (arrM || 0);
    let endMin = (depH || 11) * 60 + (depM || 0);

    if (endMin <= startMin) endMin += 24 * 60;
    
    const durationHours = Math.max(1, Math.ceil((endMin - startMin) / 60));

    // Base fee covers the 1st hour
    const baseParkingFee = hourlyRate;
    // Additional hourly fee for hours beyond the 1st
    const additionalHourlyFee = (durationHours - 1) * hourlyRate;
    // Flat processing & ALPR barrier service fee
    const serviceFee = 1.50;

    // Secure Total Calculation
    const totalEstimatedAmount = baseParkingFee + additionalHourlyFee + serviceFee;

    return {
      durationHours,
      hourlyRate,
      baseParkingFee,
      additionalHourlyFee,
      serviceFee,
      totalEstimatedAmount
    };
  };

  const { 
    durationHours, 
    hourlyRate, 
    baseParkingFee, 
    additionalHourlyFee, 
    serviceFee, 
    totalEstimatedAmount 
  } = calculateDurationAndPrice();

  // Comprehensive Validation
  const validateBooking = () => {
    setValidationError('');

    // 1. Validate slot selection
    if (!slotNumber) {
      setValidationError('Validation Error: No parking slot selected. Please pick a slot first.');
      return false;
    }

    // Check if slot status is available or reserved by current user
    if (selectedSlot.status !== 'available') {
      setValidationError(`Slot Selection Error: Slot ${slotNumber} is currently ${selectedSlot.status.toUpperCase()} and unavailable for booking.`);
      return false;
    }

    // 2. Validate Vehicle
    if (!licensePlate || licensePlate.trim().length < 2) {
      setValidationError('Vehicle Validation Error: Please enter a valid vehicle license plate number.');
      return false;
    }

    // 3. Validate Date & Time
    if (!selectedDate) {
      setValidationError('Date Error: Please select a valid reservation date.');
      return false;
    }

    if (selectedDate < todayStr) {
      setValidationError('Date Validation Error: Past dates are not allowed for reservations. Please choose today or a future date.');
      return false;
    }

    if (!startTime || !endTime) {
      setValidationError('Time Error: Both start time and end time must be specified.');
      return false;
    }

    const [arrH, arrM] = startTime.split(':').map(Number);
    const [depH, depM] = endTime.split(':').map(Number);
    const startMin = arrH * 60 + arrM;
    const endMin = depH * 60 + depM;

    if (selectedDate === todayStr) {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      // Allow minor grace period of 15 mins for current time
      if (startMin < currentMin - 15) {
        setValidationError('Time Validation Error: Reservation start time cannot be in the past.');
        return false;
      }
    }

    if (endMin <= startMin) {
      setValidationError('Time Validation Error: End time must be strictly after start time.');
      return false;
    }

    // 4. Double Booking Prevention Check
    const isDoubleBooked = bookings.some(b => {
      if (b.slotNumber === slotNumber && (b.status === 'Confirmed' || b.status === 'Checked-In')) {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        const reqStart = new Date(`${selectedDate}T${startTime}:00`);
        const reqEnd = new Date(`${selectedDate}T${endTime}:00`);
        return (reqStart < bEnd && reqEnd > bStart);
      }
      return false;
    });

    if (isDoubleBooked) {
      setValidationError(`Double Booking Prevented! Slot ${slotNumber} is already reserved for the selected time slot.`);
      return false;
    }

    return true;
  };

  // Handle Booking Confirmation
  const handleConfirmBooking = () => {
    if (!validateBooking()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Secure unique Booking ID generation
      const uniqueBookingId = 'BK-' + Math.floor(1000 + Math.random() * 9000);
      const reqStart = `${selectedDate}T${startTime}:00`;
      const reqEnd = `${selectedDate}T${endTime}:00`;

      const newBooking = createBooking({
        id: uniqueBookingId,
        userEmail: user?.email || 'driver@fastparking.com',
        userName: user?.name || 'Alex Morgan',
        slotNumber: slotNumber,
        licensePlate: licensePlate.toUpperCase().trim(),
        vehicleType,
        startTime: reqStart,
        endTime: reqEnd,
        hours: durationHours,
        totalPrice: totalEstimatedAmount
      });

      setIsSubmitting(false);

      if (newBooking) {
        navigate(`/user/payment/${newBooking.id}`, { state: { booking: newBooking } });
      } else {
        setValidationError('Failed to create booking. Please try selecting a different slot.');
      }
    }, 600);
  };

  const handleSelectRegisteredVehicle = (vehId) => {
    const found = savedVehicles.find(v => v.id === vehId);
    if (found) {
      setLicensePlate(found.licensePlate);
      setVehicleType(found.vehicleType || 'Sedan');
    }
  };

  // =========================================================================
  // BOOKING SUCCESS SCREEN
  // =========================================================================
  if (bookingSuccessData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 font-sans">
        
        {/* Success Card Header */}
        <div className="rounded-3xl bg-slate-900 border border-emerald-500/40 p-8 shadow-2xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs inline-block mb-2">
              🎉 Booking Confirmed & Slot Locked!
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Reservation Successful
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Your parking bay has been reserved. Please proceed to payment to finalize your ticket pass.
            </p>
          </div>

          {/* Ticket Details Box */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 text-left space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Booking Reference ID</span>
                <span className="text-xl font-black font-mono text-indigo-400">{bookingSuccessData.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                  Confirmed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Facility & Address</span>
                <strong className="text-white font-bold block">{parkingLocation.name}</strong>
                <span className="text-slate-400 text-[11px]">{parkingLocation.address}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Selected Slot</span>
                <strong className="text-2xl font-black text-white font-mono block">Slot {bookingSuccessData.slotNumber}</strong>
                <span className="text-indigo-400 font-semibold capitalize">{selectedSlot.type || 'Standard'} Bay</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Vehicle License Plate</span>
                <strong className="text-amber-300 font-mono font-bold text-sm block uppercase">
                  {bookingSuccessData.licensePlate} ({bookingSuccessData.vehicleType})
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Date & Reserved Time</span>
                <strong className="text-slate-200 font-medium block">
                  📅 {selectedDate}
                </strong>
                <span className="text-slate-300 font-mono">
                  ⏰ {startTime} - {endTime} ({durationHours} hrs)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-300 font-bold">Total Payable Amount</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">${bookingSuccessData.totalPrice.toFixed(2)}</span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(`/user/payment/${bookingSuccessData.id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/35 transition-all hover:scale-105 cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/user/bookings')}
              className="px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs transition-all"
            >
              View My Bookings
            </button>
          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // MAIN BOOKING CONFIRMATION FORM PAGE
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Header & Flow Breadcrumbs */}
      <div className="space-y-3 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/user/find-parking" className="hover:text-white transition-colors">Find Parking</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/parking/slots?location=${encodeURIComponent(parkingLocation.name)}`} className="hover:text-white transition-colors">Select Slot</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-bold">Booking Confirmation</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
              Booking Confirmation
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review your parking reservation parameters, vehicle info, and price breakdown before confirming.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              SSL Encrypted Checkout
            </span>
          </div>
        </div>
      </div>

      {validationError && (
        <AlertBanner
          type="error"
          message={validationError}
          onClose={() => setValidationError('')}
        />
      )}

      {/* Main 2-Column Grid: Details & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Parking & Booking Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. PARKING DETAILS CARD */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                1. Parking Facility & Slot Details
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                🟢 Bay Available
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Name</span>
                  <h4 className="text-base font-black text-white mt-0.5">{parkingLocation.name}</h4>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{parkingLocation.address}</span>
                  </p>
                </div>
                <div className="text-right pl-3 border-l border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hourly Rate</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">${hourlyRate}.00/hr</span>
                </div>
              </div>

              {/* Selected Slot Badge Box */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-black text-lg text-white font-mono">
                    {slotNumber}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block">Selected Parking Slot</span>
                    <strong className="text-white font-bold text-sm">Slot {slotNumber}</strong>
                    <span className="text-[11px] text-slate-400 block capitalize">{selectedSlot.type || 'Standard'} Bay</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/parking/slots?location=${encodeURIComponent(parkingLocation.name)}&slot=${slotNumber}`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 text-[11px] font-bold transition-all"
                >
                  Change Slot
                </button>
              </div>

              {/* Vehicle Info Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-indigo-400" /> Vehicle Identification
                  </span>
                  {savedVehicles.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-normal">Select registered vehicle</span>
                  )}
                </label>

                {savedVehicles.length > 0 && (
                  <select
                    onChange={(e) => handleSelectRegisteredVehicle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none mb-2 text-xs"
                  >
                    <option value="">-- Choose Registered Vehicle --</option>
                    {savedVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} ({v.brand} {v.model} - {v.vehicleType})
                      </option>
                    ))}
                  </select>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">License Plate *</label>
                    <input
                      type="text"
                      required
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="Plate #"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold uppercase focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Vehicle Category *</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Car">Sedan / Car</option>
                      <option value="SUV">SUV / Truck</option>
                      <option value="EV">EV Charging</option>
                      <option value="Bike">Motorcycle</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. BOOKING DETAILS CARD */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                2. Reservation Schedule & Duration
              </h3>
              <span className="text-xs text-slate-400 font-mono">{durationHours} Hours Duration</span>
            </div>

            <div className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Reservation Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Price Breakdown & Confirmation Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 shadow-2xl space-y-6">
            
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                3. Secure Price Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated securely based on official tariff rules</p>
            </div>

            {/* Price Breakdown Itemization */}
            <div className="space-y-3 text-xs">
              
              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                  Base Parking Fee (1st Hour)
                </span>
                <span className="font-mono font-bold text-white">${baseParkingFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                  Additional Hourly Fee ({durationHours > 1 ? durationHours - 1 : 0} hrs @ ${hourlyRate}/hr)
                </span>
                <span className="font-mono font-bold text-white">${additionalHourlyFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  ALPR Gate Barrier & Processing Service Fee
                </span>
                <span className="font-mono font-bold text-white">${serviceFee.toFixed(2)}</span>
              </div>

              {/* Total Estimated Amount Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1 mt-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Estimated Amount</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black text-emerald-400 font-mono">${totalEstimatedAmount.toFixed(2)}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Includes all taxes & fees</span>
                </div>
              </div>

            </div>

            {/* Security Guarantee */}
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-300 flex items-start gap-2">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>Double booking protection active. Your selected slot will be reserved immediately upon confirmation.</span>
            </div>

            {/* 4. ACTIONS */}
            <div className="space-y-3 pt-2">
              
              {/* Confirm Booking */}
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/35 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reserving Slot & Locking Booking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>

              {/* Change Slot */}
              <button
                type="button"
                onClick={() => navigate(`/parking/slots?location=${encodeURIComponent(parkingLocation.name)}&date=${selectedDate}&start=${startTime}&end=${endTime}&vehicle=${vehicleType}`)}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Slot</span>
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => navigate('/user/find-parking')}
                className="w-full py-2.5 rounded-2xl text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all text-center block"
              >
                Cancel Reservation
              </button>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default BookingConfirmationPage;
