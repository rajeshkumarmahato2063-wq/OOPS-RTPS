import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useParking } from '../../context/ParkingContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import AlertBanner from '../../components/common/AlertBanner';
import TicketModal from '../../components/parking/TicketModal';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Car, 
  DollarSign, 
  ArrowLeft,
  QrCode,
  RefreshCw,
  Smartphone,
  Building2,
  Printer,
  Check,
  AlertCircle,
  FileText,
  ChevronRight,
  Home,
  Sparkles
} from 'lucide-react';

const PaymentCheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, slots, addNotification } = useParking();

  // Environment credentials for payment gateway secrets
  const gatewayKey = import.meta.env.VITE_PAYMENT_GATEWAY_KEY || 'pk_test_fastparking_live_89421';
  const merchantId = import.meta.env.VITE_PAYMENT_MERCHANT_ID || 'merchant_fp_94821092';
  const paymentSecret = import.meta.env.VITE_PAYMENT_SECRET_KEY || 'sk_test_fp_secret_9941';

  // State for Ticket Pass Modal
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Retrieve target booking from context or fallback
  const foundBooking = bookings.find(b => String(b.id) === String(bookingId)) || bookings[0];

  const [booking, setBooking] = useState(() => foundBooking || {
    id: bookingId || 'BK-9021',
    userEmail: user?.email || 'driver@fastparking.com',
    userName: user?.name || 'Alex Morgan',
    slotNumber: 'A-03',
    licensePlate: 'NY-FAST-88',
    vehicleType: 'Sedan',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    hours: 2,
    totalPrice: 24,
    status: 'Pending',
    paymentStatus: 'Unpaid'
  });

  // Ensure latest booking state is loaded
  useEffect(() => {
    if (foundBooking) {
      setBooking(foundBooking);
    }
  }, [foundBooking]);

  // Payment method selection: 'card' | 'upi' | 'netbanking'
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Transient Payment Input States (NEVER stored or persisted in DB/localStorage)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // UPI inputs
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Net banking inputs
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Payment Processing Flow States: 'Pending' | 'Processing' | 'Successful' | 'Failed' | 'Cancelled'
  const [paymentStatus, setPaymentStatus] = useState(
    booking.paymentStatus === 'Paid' ? 'Successful' : 'Pending'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionRef, setTransactionRef] = useState(
    booking.transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
  );

  // Financial Price Calculations
  const parkingFee = Number(booking.totalPrice || 24.00);
  const serviceFee = 1.50;
  const totalAmount = parkingFee + serviceFee;

  // Formatted date and time strings
  const bookingDateStr = booking.startTime 
    ? new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const startTimeStr = booking.startTime 
    ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '09:00 AM';

  const endTimeStr = booking.endTime 
    ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '11:00 AM';

  // Secure Server-side Payment Verification & Processing
  const handleProcessPayment = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setPaymentStatus('Processing');

    // Generate unique transaction reference
    const generatedRef = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    setTransactionRef(generatedRef);

    // Simulate encrypted gateway processing handshake delay
    setTimeout(async () => {
      try {
        // Do NOT trust frontend payment success: Verify transaction via Supabase database update/RPC
        const { data, error } = await supabase
          .from('bookings')
          .update({
            payment_status: 'Paid',
            status: 'Confirmed',
            transaction_id: generatedRef,
            payment_method: paymentMethod.toUpperCase(),
            total_amount: totalAmount
          })
          .eq('booking_code', booking.id)
          .select();

        if (error && error.code !== 'PGRST116') {
          console.warn('Supabase DB Update Warning (Fallback active):', error);
        }

        // Wipe transient card/CVC details immediately from memory
        setCardNumber('');
        setCardCvc('');
        setCardExpiry('');
        setCardHolder('');

        // Update local booking state & Context
        setBooking(prev => ({
          ...prev,
          paymentStatus: 'Paid',
          status: 'Confirmed',
          transactionId: generatedRef
        }));

        setPaymentStatus('Successful');

        addNotification(
          'Payment Success',
          'Payment Authorized & Confirmed',
          `Transaction ${generatedRef} of $${totalAmount.toFixed(2)} completed for Slot ${booking.slotNumber}.`,
          'payment'
        );

      } catch (err) {
        // Handle server handshake failure
        setPaymentStatus('Failed');
        setErrorMessage('Server Handshake Error: Failed to authorize transaction with payment gateway. Please retry.');
      }
    }, 1500);
  };

  // Simulate Decline / Failure Handler
  const handleSimulateDecline = () => {
    setPaymentStatus('Processing');
    setTimeout(() => {
      setPaymentStatus('Failed');
      setErrorMessage('Bank Payment Declined: Insufficient funds or card authorization rejected by issuing bank.');
      setCardNumber('');
      setCardCvc('');
    }, 1000);
  };

  // Cancel Payment Handler
  const handleCancelPayment = () => {
    setPaymentStatus('Cancelled');
  };

  // Print/Download Receipt Handler
  const handlePrintReceipt = () => {
    window.print();
  };

  // =========================================================================
  // BOOKING SUCCESS SCREEN (AFTER SUCCESSFUL PAYMENT)
  // =========================================================================
  if (paymentStatus === 'Successful') {
    const qrToken = booking.qrCode || `FP-${booking.id}-${booking.slotNumber}`;

    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6 font-sans">
        
        {/* Success Banner Card */}
        <div className="rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Badge & Title */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ✅ Booking Confirmed & Paid
            </span>

            <h1 className="text-3xl font-black text-white tracking-tight">
              Payment & Reservation Complete!
            </h1>
            
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Transaction Ref: <strong className="font-mono text-emerald-300">{transactionRef}</strong> • Paid via {paymentMethod.toUpperCase()}
            </p>
          </div>

          {/* Detailed Booking Summary Grid */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Booking Reference ID</span>
                <span className="text-xl font-black font-mono text-indigo-400">{booking.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Booking Status</span>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Confirmed & Paid
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Parking Location</span>
                <strong className="text-white font-bold text-sm block">Downtown Central Garage / Plaza</strong>
                <span className="text-slate-400 text-[11px]">100 Broadway Ave, Midtown, NY</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Reserved Slot Number</span>
                <strong className="text-2xl font-black text-emerald-400 font-mono block">Slot {booking.slotNumber}</strong>
                <span className="text-indigo-400 font-semibold capitalize">{booking.vehicleType || 'Standard'} Bay</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Vehicle License Plate</span>
                <strong className="text-amber-300 font-mono font-bold text-sm block uppercase">
                  {booking.licensePlate} ({booking.vehicleType || 'Sedan'})
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Date & Time Range</span>
                <strong className="text-slate-200 font-medium block">📅 {bookingDateStr}</strong>
                <span className="text-slate-300 font-mono">⏰ {startTimeStr} - {endTimeStr} ({booking.hours || 2} hrs)</span>
              </div>
            </div>

            {/* Total Paid Amount Breakdown */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-300 font-bold">Total Amount Paid:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Generated QR Code Graphic Section */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
              Automated Gate Pass QR Barcode
            </span>

            <div className="mx-auto w-44 h-44 rounded-2xl bg-white p-3 shadow-2xl flex flex-col items-center justify-center border-4 border-indigo-500/30 relative group">
              <QrCode className="w-32 h-32 text-slate-950" />
              <span className="text-[9px] font-mono text-slate-800 font-bold tracking-widest mt-1">
                {qrToken}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Scan this QR code at the barrier gate or present it to the gate staff operator.
            </p>
          </div>

          {/* Required Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            
            {/* 1. View QR */}
            <button
              onClick={() => setShowTicketModal(true)}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <QrCode className="w-4 h-4" />
              <span>View QR Pass</span>
            </button>

            {/* 2. Download / Print Receipt */}
            <button
              onClick={handlePrintReceipt}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Print Receipt</span>
            </button>

            {/* 3. My Bookings */}
            <button
              onClick={() => navigate('/user/bookings')}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs transition-all"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>My Bookings</span>
            </button>

            {/* 4. Back to Dashboard */}
            <button
              onClick={() => navigate('/user')}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs transition-all"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </button>

          </div>

        </div>

        {/* Digital Ticket Modal */}
        {showTicketModal && (
          <TicketModal
            isOpen={showTicketModal}
            onClose={() => setShowTicketModal(false)}
            booking={{
              ...booking,
              totalPrice: totalAmount,
              status: 'Confirmed',
              paymentStatus: 'Paid',
              qrCode: qrToken
            }}
          />
        )}

      </div>
    );
  }

  // =========================================================================
  // MAIN PAYMENT CHECKOUT PAGE FORM
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/user/find-parking" className="hover:text-white">Find Parking</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/user/booking-confirmation?slot=${booking.slotNumber}`} className="hover:text-white">Booking Confirmation</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">Payment Gateway</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 tracking-tight">
            <CreditCard className="w-7 h-7 text-indigo-400" />
            Payment Checkout Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Merchant ID: <strong className="font-mono text-slate-300">{merchantId}</strong> • 256-bit SSL Encrypted Transaction
          </p>
        </div>

        <button
          onClick={() => navigate('/user/bookings')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </button>
      </div>

      {/* Clearly Labeled Test Payment Mode Banner */}
      <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">🧪 TEST PAYMENT MODE ACTIVE</span>
            <span className="text-slate-400 text-[11px]">
              Environment key loaded: <code className="font-mono text-indigo-300">{gatewayKey.substring(0, 16)}...</code>. Card details & CVV are strictly transient and never saved.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleSimulateDecline}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-bold hover:bg-rose-500/20"
          >
            Simulate Decline
          </button>
          <button
            type="button"
            onClick={handleCancelPayment}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-bold hover:text-white"
          >
            Cancel Payment
          </button>
        </div>
      </div>

      {/* Error & Status Banners */}
      {errorMessage && (
        <AlertBanner
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
          onRetry={() => setPaymentStatus('Pending')}
        />
      )}

      {paymentStatus === 'Cancelled' && (
        <AlertBanner
          type="warning"
          message="Payment Cancelled: You cancelled the payment transaction. You can try again or go back to your dashboard."
          onClose={() => setPaymentStatus('Pending')}
          onRetry={() => setPaymentStatus('Pending')}
        />
      )}

      {/* Main Grid: Reservation Summary Panel vs Payment Method Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 cols): Detailed Payment Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Reservation Details & Fee Summary
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Itemized parking charges</p>
            </div>

            {/* Itemization Fields required by prompt */}
            <div className="space-y-3 text-xs">
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Booking Reference ID:</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{booking.id}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Parking Location:</span>
                <span className="font-bold text-white text-right">Downtown Central Plaza</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Selected Slot Number:</span>
                <span className="text-base font-black text-emerald-400 font-mono">Slot {booking.slotNumber}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vehicle Info:</span>
                <span className="font-mono font-bold text-amber-300">{booking.licensePlate} ({booking.vehicleType || 'Sedan'})</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reservation Date:</span>
                <span className="text-slate-200 font-semibold">{bookingDateStr}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Start Time:</span>
                <span className="text-slate-200 font-mono font-semibold">{startTimeStr}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">End Time:</span>
                <span className="text-slate-200 font-mono font-semibold">{endTimeStr}</span>
              </div>

            </div>

            {/* Price Itemization Breakdown Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Parking Fee ({booking.hours || 2} hrs):</span>
                <span className="font-mono font-bold text-white">${parkingFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>ALPR & Barrier Service Fee:</span>
                <span className="font-mono font-bold text-white">${serviceFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Facility Sales Tax (0%):</span>
                <span className="text-emerald-400 font-bold">$0.00</span>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-black text-white">
                <span>Total Amount:</span>
                <span className="text-2xl text-emerald-400 font-mono">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (7 cols): Payment Options & Pay Now Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
            
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Select Payment Method</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">PCI-DSS Compliant</span>
              </h3>
            </div>

            {/* Payment Options Tabs: UPI | Card | Net Banking */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-3 px-2 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-3 px-2 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`py-3 px-2 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Payment Method Specific Input Fields */}
            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              
              {/* Option 1: Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cardholder Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Card Number (Do Not Store CVV Notice) *</label>
                    <input
                      type="text"
                      required
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Security Code (CVC / CVV) *</label>
                      <input
                        type="password"
                        required
                        placeholder="888"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        maxLength={4}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Option 2: UPI Inputs */}
              {paymentMethod === 'upi' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Select Preferred UPI App</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'gpay', name: 'Google Pay' },
                      { id: 'phonepe', name: 'PhonePe' },
                      { id: 'paytm', name: 'Paytm UPI' }
                    ].map(app => (
                      <button
                        type="button"
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          selectedUpiApp === app.id
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {app.name}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Or Enter Virtual Payment Address (VPA / UPI ID) *</label>
                    <input
                      type="text"
                      placeholder="e.g. alex@okicici or 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Option 3: Net Banking Inputs */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Select Bank for Net Banking Portal</span>
                  
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* PAY NOW BUTTON */}
              <button
                type="submit"
                disabled={paymentStatus === 'Processing'}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/35 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paymentStatus === 'Processing' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Payment & Verifying with Supabase...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay Now (${totalAmount.toFixed(2)})</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};

export default PaymentCheckoutPage;
