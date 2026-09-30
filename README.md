# 🚗 Fast Parking - Smart Real-Time Parking Slot Management System

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0.7-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Build-Production_Ready-emerald)](#)

A high-performance, full-stack, enterprise-grade Parking Slot Management Application built with **React 19**, **Vite**, **Tailwind CSS (v4)**, and **Supabase**. Features real-time slot maps, atomic double-booking prevention, QR digital pass generation, gate operator scanner tools, role-based access control, revenue analytics, and comprehensive financial reports.

---

## 🌟 Key Features

### 🔐 1. Supabase Authentication & Role-Based Access (RBAC)
- **Multi-Role Security**: Enforces 3 distinct user roles (`user`, `staff`, `admin`) with `ProtectedRoute` guards and a 403 Access Denied screen.
- **Auth Flow**: User registration, login, logout, password recovery, session persistence (`onAuthStateChange`), and quick role switching.

### 🚗 2. User Dashboard & Vehicle Management
- **Find Parking**: Live location search, date/time filtering, vehicle selector, and facility amenity cards (EV chargers, security, 24/7 access).
- **Interactive Real-Time Slot Map**: Visual slot grid with strict color codes:
  - 🟢 **Green** = Available
  - 🟡 **Yellow** = Reserved
  - 🔴 **Red** = Occupied
  - ⚪ **Gray** = Maintenance
  - 🔵 **Blue** = Selected
- **Vehicle Manager**: Full Supabase CRUD for managing vehicle fleets (License Plate, Type, Brand, Model, Color, and Default Vehicle toggle).

### 🔒 3. Concurrency Protection & Booking Flow
- **Atomic Double-Booking Prevention**: Database-level PostgreSQL row locking (`FOR UPDATE`) via RPC function `reserve_parking_slot` to guarantee zero concurrent double-bookings under high traffic.
- **Reservation Lifecycle**: Location → Slot Selection → Vehicle Selection → Date & Hours → Server Price Calculation → Unique `BK-XXXX` Ticket ID Generation.

### 💳 4. Secure Payment Gateway Checkout
- **Itemized Checkout**: Detailed breakdown (Parking Fee, Service Fee, Tax, Total Amount).
- **Transaction State Machine**: Tracks `Pending`, `Processing`, `Successful`, `Failed`, and `Refunded` states.
- **Server Verification**: Invokes `verify_payment_transaction` RPC endpoint to validate prices server-side.

### 📱 5. Digital QR Pass & Staff Gate Scanner
- **Digital Pass**: Generates high-density QR code matrix with Booking ID, Slot Number, License Plate, and Duration.
- **Staff Scanner Terminal**: Automated QR ticket verification with rejection for invalid, expired, cancelled, or already-used passes.

### 👮 6. Staff Gate Operations Dashboard
- **Operational Metrics**: Today's Bookings, Active Vehicles, Available Bays, Occupied Bays, and Upcoming Reservations.
- **Gate Tools**: Fast Check-In, Check-Out with duration-based fee calculator, and Interactive Floor Map.

### 📊 7. Admin Operations Command Center
- **7 Metric Banners**: Total Users, Total Parking Locations, Total Slots, Available Slots, Occupied Slots, Today's Bookings, and Today's Revenue.
- **Management Tabs**: Users, Staff, Parking Locations, Slots, Bookings, Payments, and Dynamic Pricing Rules.

### 📈 8. Reports, Analytics & Notifications
- **Analytics Reports**:
  - Daily & Monthly Booking Velocity
  - Gross Revenue & Per-Bay Yield ($/slot)
  - Occupancy Rate & Capacity Stress (%)
  - 24-Hour Peak Hours Traffic Density
  - Vehicle Type Fleet Distribution
  - Cancellation Rate & Refund Audit
  - 1-Click **CSV Exporter**
- **Notification System**: Real-time notification feed for Booking Confirmations, Payment Success, Cancellations, Reminders, Check-Ins, and Check-Outs.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Lucide React Icons, React Router v7
- **Backend & Database**: Supabase PostgreSQL Database, Supabase Auth, Supabase Realtime Channels
- **Concurrency & Security**: PostgreSQL RPC Functions (`reserve_parking_slot`, `verify_payment_transaction`), Row Level Security (RLS)
- **Deployment**: Vercel SPA Configuration (`vercel.json`)

---

## 🗄️ Database Schema & Supabase Setup

The project includes a complete SQL schema script located at [`supabase/schema.sql`](./supabase/schema.sql).

### Tables Created
1. `profiles` - Extended user attributes and RBAC roles (`user`, `staff`, `admin`).
2. `vehicles` - Registered driver vehicles.
3. `parking_locations` - Parking facilities/zones.
4. `parking_slots` - Real-time slot status, pricing, and features.
5. `bookings` - Reservation records, duration, QR codes, and ticket status.
6. `payments` - Payment audit logs and gateway transaction IDs.
7. `check_ins` / `check_outs` - Gate operator timestamps.
8. `pricing_rules` - Base rates, peak surcharges, EV fees.
9. `notifications` - User and system notification alerts.
10. `reviews` - User rating stars and feedback.

### Applying Schema to Supabase
1. Navigate to your **Supabase Dashboard** -> **SQL Editor**.
2. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and execute the query.

---

## 🔑 Environment Variables Setup

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Secure Payment Gateway Credentials
VITE_PAYMENT_GATEWAY_KEY=pk_test_fastparking_live_90812
VITE_PAYMENT_MERCHANT_ID=merchant.com.fastparking.app
```

---

## 💻 Local Installation & Running

### Prerequisites
- Node.js `v18.0.0` or higher
- npm or pnpm

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-username/fast-parking-system.git
cd fast-parking-system

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build production bundle
npm run build
```

---

## 🚀 Deployment Guide

### Deploying to Vercel
1. Push your repository to **GitHub**.
2. Import the project into **Vercel**.
3. Add Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.).
4. Deployment settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. The repository includes [`vercel.json`](./vercel.json) to handle single-page application (SPA) routing rewrites.

---

## 📄 License
Licensed under the **MIT License**.
