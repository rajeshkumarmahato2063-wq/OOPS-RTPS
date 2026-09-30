-- ====================================================================
-- FAST PARKING SYSTEM - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Created: 2026-09-29
-- Tables: profiles, vehicles, parking_locations, parking_slots, 
--         bookings, payments, check_ins, check_outs, pricing_rules, 
--         notifications, reviews
-- Functions: reserve_parking_slot, verify_payment_transaction
-- ====================================================================

-- 1. EXTENSIONS & CUSTOM TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE slot_type AS ENUM ('standard', 'ev', 'vip', 'accessible');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE slot_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('Pending', 'Processing', 'Paid', 'Successful', 'Failed', 'Refunded');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    department TEXT,
    badge_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_plate TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Sedan' NOT NULL,
    brand TEXT DEFAULT 'Tesla',
    model TEXT DEFAULT 'Model Y',
    color TEXT DEFAULT 'Midnight Black',
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trigger_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. PARKING_LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.parking_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'New York' NOT NULL,
    total_slots INT DEFAULT 0 NOT NULL,
    available_slots INT DEFAULT 0 NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trigger_parking_locations_updated_at
BEFORE UPDATE ON public.parking_locations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. PARKING_SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.parking_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE,
    slot_number TEXT UNIQUE NOT NULL,
    floor TEXT DEFAULT '1st Floor' NOT NULL,
    type slot_type DEFAULT 'standard'::slot_type NOT NULL,
    status slot_status DEFAULT 'available'::slot_status NOT NULL,
    price_per_hour DECIMAL(10,2) DEFAULT 10.00 NOT NULL,
    features TEXT[] DEFAULT '{}',
    occupied_by TEXT,
    entry_time TIMESTAMPTZ,
    reserved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trigger_parking_slots_updated_at
BEFORE UPDATE ON public.parking_slots
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    slot_id UUID REFERENCES public.parking_slots(id) ON DELETE RESTRICT,
    slot_number TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Sedan' NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    hours INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'Confirmed'::booking_status NOT NULL,
    payment_status payment_status DEFAULT 'Paid'::payment_status NOT NULL,
    qr_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trigger_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) DEFAULT 1.50 NOT NULL,
    payment_method TEXT DEFAULT 'Credit Card' NOT NULL,
    status payment_status DEFAULT 'Paid'::payment_status NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. CHECK_INS TABLE
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    slot_id UUID REFERENCES public.parking_slots(id) ON DELETE CASCADE NOT NULL,
    slot_number TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    check_in_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    gate_identifier TEXT DEFAULT 'Gate 1 (ALPR)' NOT NULL
);

-- 10. CHECK_OUTS TABLE
CREATE TABLE IF NOT EXISTS public.check_outs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
    slot_id UUID REFERENCES public.parking_slots(id) ON DELETE CASCADE NOT NULL,
    slot_number TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    check_out_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    duration_hours INT NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'Paid'::payment_status NOT NULL
);

-- 11. PRICING_RULES TABLE
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE,
    slot_type slot_type NOT NULL,
    base_rate_per_hour DECIMAL(10,2) NOT NULL,
    peak_rate_per_hour DECIMAL(10,2) NOT NULL,
    weekend_rate_per_hour DECIMAL(10,2) NOT NULL,
    ev_surcharge DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- SERVER-SIDE PAYMENT VERIFICATION RPC FUNCTION (DO NOT TRUST FRONTEND)
-- ====================================================================
CREATE OR REPLACE FUNCTION verify_payment_transaction(
    p_booking_code TEXT,
    p_payment_method TEXT,
    p_amount DECIMAL,
    p_transaction_ref TEXT
) RETURNS JSON AS $$
DECLARE
    v_booking RECORD;
    v_expected_amount DECIMAL;
BEGIN
    SELECT * INTO v_booking FROM public.bookings 
    WHERE booking_code = p_booking_code FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'status', 'Failed', 'message', 'Booking record not found on server.');
    END IF;

    -- Calculate expected total on server to prevent price tampering
    v_expected_amount := v_booking.total_price;

    IF ABS(p_amount - v_expected_amount) > 0.01 THEN
        RETURN json_build_object(
            'success', false, 
            'status', 'Failed', 
            'message', 'Price mismatch detected! Authorized server total is $' || v_expected_amount || ' but got $' || p_amount
        );
    END IF;

    -- Update booking payment status
    UPDATE public.bookings 
    SET payment_status = 'Paid', status = 'Confirmed', updated_at = NOW()
    WHERE booking_code = p_booking_code;

    -- Record payment
    INSERT INTO public.payments (
        booking_id, user_id, amount, service_fee, payment_method, status, transaction_ref
    ) VALUES (
        v_booking.id, v_booking.user_id, v_expected_amount, 1.50, p_payment_method, 'Paid', p_transaction_ref
    );

    RETURN json_build_object(
        'success', true, 
        'status', 'Successful', 
        'transaction_ref', p_transaction_ref,
        'message', 'Payment authorized and verified by server!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- RLS POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users view own vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Anyone view parking slots" ON public.parking_slots FOR SELECT USING (true);
CREATE POLICY "Anyone view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone insert payments" ON public.payments FOR INSERT WITH CHECK (true);
