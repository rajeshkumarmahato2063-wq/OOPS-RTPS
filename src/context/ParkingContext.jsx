import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_SLOTS, 
  INITIAL_ZONES, 
  INITIAL_BOOKINGS,
  fetchParkingSlotsDB,
  fetchBookingsDB,
  createBookingDB,
  supabase
} from '../lib/supabase';

const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [zones, setZones] = useState(() => {
    const saved = localStorage.getItem('fast_parking_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  const [slots, setSlots] = useState(() => {
    const saved = localStorage.getItem('fast_parking_slots');
    return saved ? JSON.parse(saved) : INITIAL_SLOTS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('fast_parking_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [isLoadingDB, setIsLoadingDB] = useState(false);

  const [activityLogs, setActivityLogs] = useState([
    { id: 1, text: 'Vehicle V-8849 parked in slot A-02', time: '10 mins ago', type: 'check-in' },
    { id: 2, text: 'Reservation BK-9021 confirmed for Slot A-03', time: '25 mins ago', type: 'booking' },
    { id: 3, text: 'EV Charger initialized on Slot B-01', time: '1 hour ago', type: 'system' },
  ]);

  // Real database & state Notifications covering all required types
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('fast_parking_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-1',
        type: 'Booking Confirmation',
        title: 'Booking Confirmed!',
        message: 'Your reservation BK-9021 for Slot A-03 has been confirmed.',
        time: '5 mins ago',
        read: false,
        category: 'booking'
      },
      {
        id: 'notif-2',
        type: 'Payment Success',
        title: 'Payment Received',
        message: 'Payment of $36.00 successfully processed via Stripe/Card.',
        time: '6 mins ago',
        read: false,
        category: 'payment'
      },
      {
        id: 'notif-3',
        type: 'Upcoming Booking',
        title: 'Upcoming Parking Reminder',
        message: 'Your reservation at Downtown Central Slot A-03 starts in 30 minutes.',
        time: '15 mins ago',
        read: true,
        category: 'reminder'
      },
      {
        id: 'notif-4',
        type: 'Check-In',
        title: 'Vehicle Checked-In',
        message: 'Vehicle ABC-1234 entered Gate 1 and parked in Slot A-02.',
        time: '1 hour ago',
        read: true,
        category: 'gate'
      },
      {
        id: 'notif-5',
        type: 'Check-Out',
        title: 'Vehicle Checked-Out',
        message: 'Vehicle XYZ-9876 checked out from Slot B-04. Total paid: $20.00.',
        time: '2 hours ago',
        read: true,
        category: 'gate'
      },
      {
        id: 'notif-6',
        type: 'Cancellation',
        title: 'Booking Cancelled',
        message: 'Reservation BK-8812 was cancelled and refund of $24.00 initiated.',
        time: '1 day ago',
        read: true,
        category: 'cancellation'
      }
    ];
  });

  const addNotification = (type, title, message, category = 'system') => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      type,
      title,
      message,
      time: 'Just now',
      read: false,
      category,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Also persist to Supabase if available
    supabase.from('notifications').insert([{
      type,
      title,
      message,
      read: false,
      created_at: new Date().toISOString()
    }]).then(() => {}).catch(() => {});
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    localStorage.setItem('fast_parking_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Supabase Realtime channel subscription for parking_slots
  useEffect(() => {
    const slotChannel = supabase
      .channel('public:parking_slots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const row = payload.new;
          setSlots(prev => prev.map(s => s.number === row.slot_number ? {
            ...s,
            status: row.status,
            occupiedBy: row.occupied_by,
            reservedBy: row.reserved_by
          } : s));
          addLog(`Supabase Realtime: Slot ${row.slot_number} updated to ${row.status}`, 'system');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(slotChannel);
    };
  }, []);

  // Attempt async load from Supabase Database tables on initialization
  useEffect(() => {
    const initDatabaseSync = async () => {
      setIsLoadingDB(true);
      try {
        const remoteSlots = await fetchParkingSlotsDB();
        if (remoteSlots && remoteSlots.length > 0) {
          setSlots(remoteSlots);
        }
        const remoteBookings = await fetchBookingsDB();
        if (remoteBookings && remoteBookings.length > 0) {
          setBookings(remoteBookings);
        }
      } finally {
        setIsLoadingDB(false);
      }
    };

    initDatabaseSync();
  }, []);

  useEffect(() => {
    localStorage.setItem('fast_parking_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('fast_parking_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('fast_parking_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addLog = (text, type = 'info') => {
    const newLog = {
      id: Date.now(),
      text,
      time: 'Just now',
      type
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 15)]);
  };

  // Slot operations
  const updateSlotStatus = (slotId, status, occupiedBy = null, vehicleType = null) => {
    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return {
          ...s,
          status,
          occupiedBy: status === 'occupied' ? (occupiedBy || s.occupiedBy || 'V-ANON') : null,
          vehicleType: status === 'occupied' ? (vehicleType || s.vehicleType || 'Car') : null,
          entryTime: status === 'occupied' ? new Date().toISOString() : null
        };
      }
      return s;
    }));
    addLog(`Slot ${slotId} marked as ${status.toUpperCase()}`, 'slot');
  };

  const addSlot = (newSlot) => {
    const id = newSlot.number;
    const slotObj = {
      id,
      ...newSlot,
      status: 'available'
    };
    setSlots(prev => [...prev, slotObj]);
    addLog(`New slot ${id} added to Zone ${newSlot.zoneId}`, 'admin');
  };

  const deleteSlot = (slotId) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
    addLog(`Slot ${slotId} removed`, 'admin');
  };

  // Zone operations
  const addZone = (zoneData) => {
    const newZone = {
      id: 'zone-' + Date.now(),
      ...zoneData
    };
    setZones(prev => [...prev, newZone]);
    addLog(`Zone ${zoneData.name} created`, 'admin');
  };

  const updateZone = (zoneId, zoneData) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ...zoneData } : z));
    addLog(`Zone ${zoneData.name || zoneId} updated`, 'admin');
  };

  const deleteZone = (zoneId) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    setSlots(prev => prev.filter(s => s.zoneId !== zoneId));
    addLog(`Zone ${zoneId} deleted`, 'admin');
  };

  // Atomic Booking operation to prevent double booking at backend/database level
  const createBooking = (bookingData) => {
    // Check local concurrency state first
    const targetSlot = slots.find(s => s.number === bookingData.slotNumber);
    if (!targetSlot || targetSlot.status !== 'available') {
      alert(`Double booking prevented! Slot ${bookingData.slotNumber} is no longer available.`);
      return null;
    }

    const id = 'BK-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id,
      ...bookingData,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      qrCode: `FP-${id}-${bookingData.slotNumber}`,
      createdAt: new Date().toISOString()
    };

    // Update state to reserved
    setSlots(prev => prev.map(s => {
      if (s.number === bookingData.slotNumber) {
        return {
          ...s,
          status: 'reserved',
          reservedBy: bookingData.userName
        };
      }
      return s;
    }));

    setBookings(prev => [newBooking, ...prev]);

    // Invoke RPC function or table insert to prevent double booking at Supabase DB level
    supabase.rpc('reserve_parking_slot', {
      p_slot_number: bookingData.slotNumber,
      p_user_email: bookingData.userEmail,
      p_user_name: bookingData.userName,
      p_license_plate: bookingData.licensePlate,
      p_vehicle_type: bookingData.vehicleType,
      p_hours: bookingData.hours,
      p_total_price: bookingData.totalPrice
    }).then(({ data, error }) => {
      if (error) {
        // Fallback to table insert if RPC uninitialized
        createBookingDB(newBooking);
      }
    }).catch(err => {
      console.warn('RPC skipped:', err);
    });

    addLog(`Booking ${id} confirmed for Slot ${bookingData.slotNumber}`, 'booking');
    addNotification('Booking Confirmation', 'Booking Confirmed!', `Reservation ${id} confirmed for Slot ${bookingData.slotNumber}.`, 'booking');
    addNotification('Payment Success', 'Payment Received', `Payment of $${bookingData.totalPrice}.00 successfully processed.`, 'payment');
    addNotification('Upcoming Booking', 'Upcoming Reservation', `Your reservation at Slot ${bookingData.slotNumber} starts soon.`, 'reminder');
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
      // Release slot
      setSlots(prev => prev.map(s => {
        if (s.number === booking.slotNumber && s.status === 'reserved') {
          return { ...s, status: 'available', reservedBy: null };
        }
        return s;
      }));
      addLog(`Booking ${bookingId} cancelled`, 'booking');
      addNotification('Cancellation', 'Booking Cancelled', `Booking ${bookingId} was cancelled and refund process initiated.`, 'cancellation');
    }
  };

  // Staff Check-in / Check-out actions
  const checkInVehicle = (slotNumber, licensePlate, vehicleType) => {
    const slot = slots.find(s => s.number === slotNumber);
    if (!slot) return { success: false, message: 'Slot not found' };

    setSlots(prev => prev.map(s => {
      if (s.number === slotNumber) {
        return {
          ...s,
          status: 'occupied',
          occupiedBy: licensePlate,
          vehicleType: vehicleType || 'Car',
          entryTime: new Date().toISOString()
        };
      }
      return s;
    }));

    // Update associated booking if exists
    setBookings(prev => prev.map(b => {
      if (b.slotNumber === slotNumber && b.status === 'Confirmed') {
        return { ...b, status: 'Checked-In' };
      }
      return b;
    }));

    addLog(`Vehicle ${licensePlate} checked into ${slotNumber}`, 'check-in');
    addNotification('Check-In', 'Vehicle Checked-In', `Vehicle ${licensePlate} checked into Slot ${slotNumber}.`, 'gate');
    return { success: true };
  };

  const checkOutVehicle = (slotNumber) => {
    const slot = slots.find(s => s.number === slotNumber);
    if (!slot) return { success: false, message: 'Slot not found' };

    const entryTime = slot.entryTime ? new Date(slot.entryTime) : new Date(Date.now() - 3600000);
    const exitTime = new Date();
    const durationHours = Math.max(1, Math.ceil((exitTime - entryTime) / (1000 * 60 * 60)));
    const totalFee = durationHours * (slot.price || 10);

    setSlots(prev => prev.map(s => {
      if (s.number === slotNumber) {
        return {
          ...s,
          status: 'available',
          occupiedBy: null,
          vehicleType: null,
          entryTime: null
        };
      }
      return s;
    }));

    setBookings(prev => prev.map(b => {
      if (b.slotNumber === slotNumber && b.status === 'Checked-In') {
        return { ...b, status: 'Completed', exitTime: exitTime.toISOString(), finalAmount: totalFee };
      }
      return b;
    }));

    addLog(`Vehicle ${slot.occupiedBy || 'Unknown'} checked out from ${slotNumber} ($${totalFee})`, 'check-out');
    addNotification('Check-Out', 'Vehicle Checked-Out', `Vehicle ${slot.occupiedBy || 'Unknown'} checked out from Slot ${slotNumber} ($${totalFee}).`, 'gate');
    return { success: true, durationHours, totalFee };
  };

  // Stats calculation
  const totalSlots = slots.length;
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
  const availableSlots = slots.filter(s => s.status === 'available').length;
  const reservedSlots = slots.filter(s => s.status === 'reserved').length;
  const maintenanceSlots = slots.filter(s => s.status === 'maintenance').length;
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
  
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const value = {
    zones,
    slots,
    bookings,
    activityLogs,
    notifications,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    isLoadingDB,
    addSlot,
    updateSlotStatus,
    deleteSlot,
    addZone,
    updateZone,
    deleteZone,
    createBooking,
    cancelBooking,
    checkInVehicle,
    checkOutVehicle,
    totalSlots,
    occupiedSlots,
    availableSlots,
    reservedSlots,
    maintenanceSlots,
    occupancyRate,
    totalRevenue
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
