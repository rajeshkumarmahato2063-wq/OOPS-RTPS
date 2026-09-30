import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParking } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';
import { 
  Car, 
  Search, 
  Calendar, 
  Clock, 
  Navigation, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  ChevronDown, 
  MapPin, 
  CreditCard, 
  BarChart3, 
  Users, 
  PhoneCall, 
  Mail, 
  Menu, 
  X, 
  HelpCircle,
  Check,
  Building2,
  Lock,
  Compass
} from 'lucide-react';

const LandingPage = () => {
  const { availableSlots, totalSlots, zones } = useParking();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search Widget State
  const [searchLocation, setSearchLocation] = useState('Downtown Central');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [vehicleType, setVehicleType] = useState('Car');

  // FAQ Accordion Active Index
  const [openFaq, setOpenFaq] = useState(0);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/user/find-parking?location=${encodeURIComponent(searchLocation)}&date=${searchDate}&vehicle=${vehicleType}`);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: 'How does real-time parking slot reservation work?',
      a: 'Our platform uses WebSocket channels connected to Supabase Realtime to track bay occupancy. When you reserve a slot, our database executes an atomic row lock to prevent double bookings. You receive a guaranteed digital pass instantly.'
    },
    {
      q: 'Can I cancel or modify my parking reservation?',
      a: 'Yes! Reservations can be cancelled up to 15 minutes prior to start time directly from your My Bookings dashboard. Refunds are processed automatically back to your payment method.'
    },
    {
      q: 'What happens if I arrive earlier or stay past my reserved time?',
      a: 'Our gate terminal logs your exact entry and exit timestamps. If you exceed your booked duration, the system automatically calculates the overage at the standard hourly rate upon check-out.'
    },
    {
      q: 'How does staff QR code verification work at the entrance gate?',
      a: 'Authorized staff scan your digital QR pass using the Staff Gate Terminal scanner. The system instantly verifies ticket validity, slot assignment, payment status, and logs vehicle entry.'
    },
    {
      q: 'Are EV fast-charging stations available at all parking locations?',
      a: 'Most of our premium parking facilities feature dedicated EV charging bays equipped with Level 2 and Level 3 DC Fast Chargers. Filter by "EV Charger" during search to view availability.'
    }
  ];

  const parkingFacilities = [
    {
      id: 'downtown-1',
      name: 'Downtown Central Garage',
      address: '100 Main Street, Financial District',
      price: 8,
      rating: 4.9,
      reviewsCount: 128,
      totalSlots: 45,
      availableSlots: 18,
      features: ['EV Charging', '24/7 Security', 'Covered'],
      image: 'https://images.unsplash.com/photo-1506521782020-18925f46c2bf?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'tech-plaza',
      name: 'Tech Plaza Executive Hub',
      address: '450 Innovation Blvd, Tech Corridor',
      price: 12,
      rating: 4.8,
      reviewsCount: 94,
      totalSlots: 30,
      availableSlots: 12,
      features: ['VIP Valet', 'EV Fast Charge', 'CCTV'],
      image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'westside-mall',
      name: 'Westside Metro Mall Park',
      address: '880 Westside Ave, Shopping District',
      price: 6,
      rating: 4.7,
      reviewsCount: 156,
      totalSlots: 60,
      availableSlots: 24,
      features: ['Accessible Ramp', 'Wide Bays', 'Direct Mall Entry'],
      image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
      
      {/* ========================================================================= */}
      {/* 1. RESPONSIVE NAVBAR */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Fast<span className="text-indigo-400">Parking</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    v2.4
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Smart Parking Telemetry</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
              <Link to="/" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Home</Link>
              <Link to="/user/find-parking" className="hover:text-white transition-colors">Find Parking</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#facilities" className="hover:text-white transition-colors">Locations</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>

            {/* User Account / Auth Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/user'}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    Register Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-indigo-400 font-bold">Home</Link>
              <Link to="/user/find-parking" onClick={() => setMobileMenuOpen(false)}>Find Parking</Link>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#facilities" onClick={() => setMobileMenuOpen(false)}>Locations</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/user'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Dashboard Access
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg"
                  >
                    Register Account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden py-16 lg:py-28 border-b border-slate-800/60">
        
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Real-Time Supabase Slot Reservation System</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
              Find Your Parking Spot <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Before You Arrive
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Never circle the block again. Reserve guaranteed parking bays in real-time, generate instant digital QR passes, and enjoy zero-delay contact-free entry.
            </p>
          </div>

          {/* Interactive Hero Search Card */}
          <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Location
                </label>
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Downtown Central">Downtown Central</option>
                  <option value="Tech Plaza Hub">Tech Plaza Hub</option>
                  <option value="Westside Mall">Westside Mall</option>
                  <option value="Airport Terminal 1">Airport Terminal 1</option>
                </select>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Date
                </label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Time Range Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Vehicle Type Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-400" />
                  Vehicle
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Car">Sedan / Car</option>
                  <option value="SUV">SUV / Truck</option>
                  <option value="EV">EV Charger</option>
                  <option value="Bike">Motorcycle</option>
                </select>
              </div>

              {/* Submit Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/35 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Parking</span>
                </button>
              </div>

            </form>

            {/* Live Telemetry Pill Banner */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Database Telemetry: <strong className="text-white font-bold">{availableSlots} of {totalSlots} bays available</strong> right now</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Atomic Lock Protected
                </span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Instant Pass
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURES SECTION */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-slate-950 border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Core Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for Speed, Reliability, and Security
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Built on modern real-time infrastructure to transform urban parking into a seamless experience.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="mt-5 text-lg font-bold text-white">Real-Time Telemetry</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Live Supabase WebSocket channels reflect slot availability second-by-second across all garages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <Navigation className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="mt-5 text-lg font-bold text-white">Easy 3-Click Booking</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Pick your preferred facility, choose your exact bay on the visual map, and confirm in seconds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="mt-5 text-lg font-bold text-white">Secure Payments</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Server-validated checkout prevents price tampering with instant receipts and refund protection.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <QrCode className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="mt-5 text-lg font-bold text-white">QR Gate Scanner</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                High-density digital QR pass for contact-free entry with instant verification at staff terminals.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS SECTION */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-950/60 border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Simple 4-Step Process</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How Fast Parking Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              From search to parking in under 60 seconds.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                01
              </div>
              <h4 className="text-base font-bold text-white">Search Location</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your destination, date, and arrival time to view live open slots.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-cyan-600/30">
                02
              </div>
              <h4 className="text-base font-bold text-white">Select Slot</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick your preferred bay on the interactive map (Standard, EV Fast Charge, or VIP).
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
                03
              </div>
              <h4 className="text-base font-bold text-white">Reserve & Pay</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete checkout securely and receive your digital QR entry pass instantly.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                04
              </div>
              <h4 className="text-base font-bold text-white">Scan & Park</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan your QR code at the entrance gate and drive directly into your reserved bay.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PARKING LOCATIONS SECTION */}
      {/* ========================================================================= */}
      <section id="facilities" className="py-20 bg-slate-950 border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Featured Facilities</h2>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                Top Parking Locations
              </h3>
            </div>
            <Link
              to="/user/find-parking"
              className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Explore All Locations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {parkingFacilities.map((facility) => (
              <div key={facility.id} className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-800">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{facility.rating}</span>
                      <span className="text-slate-400 text-[10px]">({facility.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h4 className="text-lg font-bold text-white">{facility.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{facility.address}</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {facility.features.map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-emerald-400">${facility.price}</span>
                    <span className="text-xs text-slate-400"> / hr</span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      <strong className="text-emerald-400">{facility.availableSlots} bays</strong> free
                    </span>
                  </div>

                  <Link
                    to={`/user/find-parking?location=${encodeURIComponent(facility.name)}`}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATISTICS SECTION */}
      {/* ========================================================================= */}
      <section className="py-16 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-purple-950/40 border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">50,000+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bookings Completed</div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">99.8%</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Occupancy Accuracy</div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-cyan-400 tracking-tight">15+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Smart Facilities</div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-purple-400 tracking-tight">&lt; 3 Sec</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">QR Gate Scan Speed</div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. REVIEWS & TESTIMONIALS SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Driver Reviews</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by Thousands Every Day
            </h3>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Fast Parking saved my morning commute! I reserved my spot at Tech Plaza from my phone, scanned my QR pass at the gate, and was parked in under 10 seconds."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  JD
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Jason Driver</h5>
                  <span className="text-[10px] text-slate-400">Verified Executive Driver</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The EV charging bay reservation feature is incredible. Knowing I have a guaranteed charger waiting for my Tesla gives me total peace of mind."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">
                  SL
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Sarah Lim</h5>
                  <span className="text-[10px] text-slate-400">EV Fleet User</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "As a parking garage manager, the staff gate scanner and admin telemetry have eliminated entry bottlenecks completely. Highly recommended!"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  MR
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Michael Roberts</h5>
                  <span className="text-[10px] text-slate-400">Facility Operations Manager</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-slate-950/60 border-b border-slate-800/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">Got Questions?</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="mt-12 space-y-4">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-indigo-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 mt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. PROFESSIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-lg">
                  <Car className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Fast<span className="text-indigo-400">Parking</span>
                </span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed">
                Next-generation real-time parking slot management system built with React 19, Vite, and Supabase.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Realtime Active
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/user/find-parking" className="hover:text-white transition-colors">Find Parking</Link></li>
                <li><Link to="/user/bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
                <li><Link to="/user/vehicles" className="hover:text-white transition-colors">My Vehicles</Link></li>
                <li><Link to="/staff" className="hover:text-cyan-400 transition-colors">Staff Terminal</Link></li>
                <li><Link to="/admin" className="hover:text-purple-400 transition-colors">Admin Panel</Link></li>
              </ul>
            </div>

            {/* Parking Locations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Top Locations</h4>
              <ul className="space-y-2">
                <li><Link to="/user/find-parking" className="hover:text-white transition-colors">Downtown Central Garage</Link></li>
                <li><Link to="/user/find-parking" className="hover:text-white transition-colors">Tech Plaza Executive Hub</Link></li>
                <li><Link to="/user/find-parking" className="hover:text-white transition-colors">Westside Metro Mall Park</Link></li>
                <li><Link to="/user/find-parking" className="hover:text-white transition-colors">Airport Terminal 1</Link></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Support & Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-indigo-400" /> support@fastparking.app</li>
                <li className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-indigo-400" /> +1 (800) 555-PARK</li>
                <li><a href="#faq" className="hover:text-white transition-colors">Help Center & FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <p>© 2026 Fast Parking Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
              <span>Status: 100% Operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
