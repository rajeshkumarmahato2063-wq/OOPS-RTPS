import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyz-fast-parking.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====================================================================
// INITIAL MOCK / FALLBACK DATA
// ====================================================================
export const INITIAL_ZONES = [
  { id: 'zone-a', name: 'Zone A - Executive Floor', floor: '1st Floor', ratePerHour: 12, maxSlots: 12, description: 'Near entrance & elevators, premium shaded bays.' },
  { id: 'zone-b', name: 'Zone B - EV Charging Hub', floor: '1st Floor', ratePerHour: 15, maxSlots: 10, description: 'Equipped with 150kW DC fast chargers.' },
  { id: 'zone-c', name: 'Zone C - Standard Parking', floor: '2nd Floor', ratePerHour: 8, maxSlots: 16, description: 'Economic standard parking bays.' },
  { id: 'zone-d', name: 'Zone D - Accessible & VIP', floor: 'Ground Floor', ratePerHour: 10, maxSlots: 8, description: 'Wide bays with direct ramp access.' },
];

export const INITIAL_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'Downtown Central Garage',
    address: '100 Main Street, Financial District, NY',
    city: 'New York',
    rating: 4.9,
    pricePerHour: 8,
    totalSlots: 45,
    availableSlots: 18,
    facilities: ['EV Charging', '24/7 Security', 'Covered'],
    image: '/images/downtown_central_garage.jpg'
  },
  {
    id: 'loc-2',
    name: 'EV Ultra-Fast Charging Hub',
    address: '250 5th Avenue, Tech District, NY',
    city: 'New York',
    rating: 4.8,
    pricePerHour: 15,
    totalSlots: 30,
    availableSlots: 12,
    facilities: ['150kW DC Fast Chargers', 'Priority EV Bays', 'CCS & NACS Connectors', 'Solar Roof Canopy'],
    image: '/images/tech_plaza_hub.jpg'
  },
  {
    id: 'loc-3',
    name: 'Westside Metro Mall Park',
    address: '880 Westside Ave, Shopping District, NY',
    city: 'New York',
    rating: 4.7,
    pricePerHour: 6,
    totalSlots: 60,
    availableSlots: 24,
    facilities: ['Accessible Ramp', 'Wide Bays', 'Direct Mall Entry'],
    image: '/images/westside_mall_park.jpg'
  },
  {
    id: 'loc-4',
    name: 'VIP Executive & Accessible Deck',
    address: '75 Park Avenue, Upper East Side, NY',
    city: 'New York',
    rating: 4.95,
    pricePerHour: 10,
    totalSlots: 8,
    availableSlots: 5,
    facilities: ['Disability Ramp Access', 'VIP Valet Service', 'Direct Terminal Ramp', 'Security Escort'],
    image: '/images/downtown_central_garage.jpg'
  }
];

export const INITIAL_SLOTS = [
  // Zone A
  { id: 'A-01', zoneId: 'zone-a', number: 'A-01', type: 'standard', status: 'available', price: 12, features: ['Covered', 'Near Exit'] },
  { id: 'A-02', zoneId: 'zone-a', number: 'A-02', type: 'standard', status: 'occupied', price: 12, occupiedBy: 'V-8849', vehicleType: 'Sedan', entryTime: '2026-09-29T19:30:00Z', features: ['Covered'] },
  { id: 'A-03', zoneId: 'zone-a', number: 'A-03', type: 'vip', status: 'reserved', price: 15, reservedBy: 'Alex Morgan', features: ['VIP', 'CCTV'] },
  { id: 'A-04', zoneId: 'zone-a', number: 'A-04', type: 'standard', status: 'available', price: 12, features: ['Covered'] },
  { id: 'A-05', zoneId: 'zone-a', number: 'A-05', type: 'standard', status: 'maintenance', price: 12, features: ['Sensor Check'] },
  { id: 'A-06', zoneId: 'zone-a', number: 'A-06', type: 'standard', status: 'available', price: 12, features: ['Covered'] },

  // Zone B (EV Hub)
  { id: 'B-01', zoneId: 'zone-b', number: 'B-01', type: 'ev', status: 'occupied', price: 15, occupiedBy: 'TESLA-99', vehicleType: 'EV SUV', entryTime: '2026-09-29T20:15:00Z', features: ['150kW Charger'] },
  { id: 'B-02', zoneId: 'zone-b', number: 'B-02', type: 'ev', status: 'available', price: 15, features: ['150kW Charger'] },
  { id: 'B-03', zoneId: 'zone-b', number: 'B-03', type: 'ev', status: 'available', price: 15, features: ['150kW Charger'] },
  { id: 'B-04', zoneId: 'zone-b', number: 'B-04', type: 'ev', status: 'reserved', price: 15, reservedBy: 'Sarah Connor', features: ['50kW Charger'] },
  
  // Zone C
  { id: 'C-01', zoneId: 'zone-c', number: 'C-01', type: 'standard', status: 'available', price: 8, features: ['Wide Space'] },
  { id: 'C-02', zoneId: 'zone-c', number: 'C-02', type: 'standard', status: 'occupied', price: 8, occupiedBy: 'MH-12-AB-4021', vehicleType: 'Hatchback', entryTime: '2026-09-29T18:00:00Z', features: [] },
  { id: 'C-03', zoneId: 'zone-c', number: 'C-03', type: 'standard', status: 'available', price: 8, features: [] },
  { id: 'C-04', zoneId: 'zone-c', number: 'C-04', type: 'standard', status: 'available', price: 8, features: [] },

  // Zone D
  { id: 'D-01', zoneId: 'zone-d', number: 'D-01', type: 'accessible', status: 'available', price: 10, features: ['Disability Ramp'] },
  { id: 'D-02', zoneId: 'zone-d', number: 'D-02', type: 'accessible', status: 'occupied', price: 10, occupiedBy: 'CA-77-90', vehicleType: 'Van', entryTime: '2026-09-29T17:45:00Z', features: ['Disability Ramp'] },
  { id: 'D-03', zoneId: 'zone-d', number: 'D-03', type: 'vip', status: 'available', price: 15, features: ['Valet Access'] },
];

export const INITIAL_BOOKINGS = [
  {
    id: 'BK-9021',
    userEmail: 'user@fastparking.com',
    userName: 'Alex Morgan',
    slotNumber: 'A-03',
    licensePlate: 'NY-FAST-88',
    vehicleType: 'Sedan',
    startTime: '2026-09-29T21:30:00Z',
    endTime: '2026-09-29T23:30:00Z',
    hours: 2,
    totalPrice: 30,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    qrCode: 'FP-BK9021-A03',
    createdAt: '2026-09-29T20:00:00Z'
  },
  {
    id: 'BK-8942',
    userEmail: 'user@fastparking.com',
    userName: 'Alex Morgan',
    slotNumber: 'B-04',
    licensePlate: 'EV-VOLT-01',
    vehicleType: 'EV SUV',
    startTime: '2026-09-30T10:00:00Z',
    endTime: '2026-09-30T14:00:00Z',
    hours: 4,
    totalPrice: 60,
    status: 'Upcoming',
    paymentStatus: 'Paid',
    qrCode: 'FP-BK8942-B04',
    createdAt: '2026-09-29T18:30:00Z'
  },
  {
    id: 'BK-7721',
    userEmail: 'driver@test.com',
    userName: 'John Doe',
    slotNumber: 'C-02',
    licensePlate: 'MH-12-AB-4021',
    vehicleType: 'Hatchback',
    startTime: '2026-09-29T18:00:00Z',
    endTime: '2026-09-29T22:00:00Z',
    hours: 4,
    totalPrice: 32,
    status: 'Checked-In',
    paymentStatus: 'Paid',
    qrCode: 'FP-BK7721-C02',
    createdAt: '2026-09-29T17:30:00Z'
  }
];

export const INITIAL_USERS = [
  { id: 'u1', name: 'Alex Morgan', email: 'user@fastparking.com', role: 'user', vehicle: 'NY-FAST-88', phone: '+1 555-0192', status: 'Active' },
  { id: 'u2', name: 'Officer Sarah Connor', email: 'staff@fastparking.com', role: 'staff', badgeNumber: 'ST-402', phone: '+1 555-0841', status: 'Active' },
  { id: 'u3', name: 'System Admin', email: 'admin@fastparking.com', role: 'admin', department: 'Operations', phone: '+1 555-0001', status: 'Active' },
  { id: 'u4', name: 'Robert Vance', email: 'robert@company.com', role: 'user', vehicle: 'V-8849', phone: '+1 555-3921', status: 'Active' },
];

export const INITIAL_VEHICLES = [
  { id: 'v1', licensePlate: 'NY-FAST-88', vehicleType: 'Sedan', brand: 'Tesla', model: 'Model Y', color: 'Pearl White', isDefault: true },
  { id: 'v2', licensePlate: 'EV-VOLT-01', vehicleType: 'EV SUV', brand: 'BMW', model: 'iX xDrive50', color: 'Midnight Black', isDefault: false },
  { id: 'v3', licensePlate: 'CA-4091-AB', vehicleType: 'Hatchback', brand: 'Volkswagen', model: 'Golf GTI', color: 'Tornado Red', isDefault: false },
];

// ====================================================================
// DATABASE API HELPER METHODS WITH GRACEFUL FALLBACK
// ====================================================================

export const fetchParkingLocationsDB = async () => {
  try {
    const { data, error } = await supabase.from('parking_locations').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map((l, index) => ({
      id: l.id,
      name: l.name,
      address: l.address,
      city: l.city || 'New York',
      totalSlots: l.total_slots || 12,
      availableSlots: l.available_slots || 8,
      pricePerHour: 12,
      rating: 4.8,
      facilities: ['Covered Parking', '24/7 CCTV', 'ALPR Gate barrier', 'EV Fast Charging'],
      description: l.description
    }));
  } catch (e) {
    return null;
  }
};

export const fetchParkingSlotsDB = async () => {
  try {
    const { data, error } = await supabase.from('parking_slots').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map(s => ({
      id: s.slot_number || s.id,
      zoneId: s.floor === '2nd Floor' ? 'zone-c' : s.type === 'ev' ? 'zone-b' : s.type === 'accessible' ? 'zone-d' : 'zone-a',
      number: s.slot_number,
      type: s.type,
      status: s.status,
      price: s.price_per_hour,
      occupiedBy: s.occupied_by,
      entryTime: s.entry_time,
      reservedBy: s.reserved_by,
      features: s.features || []
    }));
  } catch (e) {
    return null;
  }
};

export const fetchBookingsDB = async () => {
  try {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map(b => ({
      id: b.booking_code || b.id,
      userEmail: b.user_email,
      userName: b.user_name,
      slotNumber: b.slot_number,
      licensePlate: b.license_plate,
      vehicleType: b.vehicle_type,
      startTime: b.start_time,
      endTime: b.end_time,
      hours: b.hours,
      totalPrice: b.total_price,
      status: b.status,
      paymentStatus: b.payment_status,
      qrCode: b.qr_code,
      createdAt: b.created_at
    }));
  } catch (e) {
    return null;
  }
};

export const createBookingDB = async (bookingData) => {
  try {
    const { data, error } = await supabase.from('bookings').insert([{
      booking_code: bookingData.id,
      user_email: bookingData.userEmail,
      user_name: bookingData.userName,
      slot_number: bookingData.slotNumber,
      license_plate: bookingData.licensePlate,
      vehicle_type: bookingData.vehicleType,
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      hours: bookingData.hours,
      total_price: bookingData.totalPrice,
      status: 'Confirmed',
      payment_status: 'Paid',
      qr_code: bookingData.qrCode
    }]).select();
    return { data, error };
  } catch (err) {
    return { error: err };
  }
};

// Vehicles CRUD methods
export const fetchVehiclesDB = async () => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map(v => ({
      id: v.id,
      licensePlate: v.license_plate,
      vehicleType: v.vehicle_type,
      brand: v.brand,
      model: v.model,
      color: v.color,
      isDefault: v.is_default
    }));
  } catch (e) {
    return null;
  }
};

export const insertVehicleDB = async (vehicleData) => {
  try {
    const { data, error } = await supabase.from('vehicles').insert([{
      license_plate: vehicleData.licensePlate,
      vehicle_type: vehicleData.vehicleType,
      brand: vehicleData.brand,
      model: vehicleData.model,
      color: vehicleData.color,
      is_default: vehicleData.isDefault || false
    }]).select();
    return { data, error };
  } catch (err) {
    return { error: err };
  }
};

export const updateVehicleDB = async (id, vehicleData) => {
  try {
    const { data, error } = await supabase.from('vehicles').update({
      license_plate: vehicleData.licensePlate,
      vehicle_type: vehicleData.vehicleType,
      brand: vehicleData.brand,
      model: vehicleData.model,
      color: vehicleData.color,
      is_default: vehicleData.isDefault
    }).eq('id', id).select();
    return { data, error };
  } catch (err) {
    return { error: err };
  }
};

export const deleteVehicleDB = async (id) => {
  try {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    return { error };
  } catch (err) {
    return { error: err };
  }
};
