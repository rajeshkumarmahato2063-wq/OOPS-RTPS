import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import NotFoundPage from '../pages/NotFoundPage';

// User pages
import UserDashboard from '../pages/user/UserDashboard';
import FindParking from '../pages/user/FindParking';
import UserBookings from '../pages/user/UserBookings';
import UserVehicles from '../pages/user/UserVehicles';
import UserProfile from '../pages/user/UserProfile';
import PaymentCheckoutPage from '../pages/user/PaymentCheckoutPage';
import ParkingDetails from '../pages/user/ParkingDetails';
import SlotSelectionPage from '../pages/user/SlotSelectionPage';
import BookingConfirmationPage from '../pages/user/BookingConfirmationPage';

// Staff pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffCheckIn from '../pages/staff/StaffCheckIn';
import StaffSlotOverview from '../pages/staff/StaffSlotOverview';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminSlotManagement from '../pages/admin/AdminSlotManagement';
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import AdminReports from '../pages/admin/AdminReports';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Main Application Routes inside Layout */}
      <Route element={<Layout />}>
        
        {/* Driver / User Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'staff', 'admin']} />}>
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/find-parking" element={<FindParking />} />
          <Route path="/user/bookings" element={<UserBookings />} />
          <Route path="/user/vehicles" element={<UserVehicles />} />
          <Route path="/user/payments" element={<UserDashboard activeDefaultTab="payments" />} />
          <Route path="/user/history" element={<UserDashboard activeDefaultTab="history" />} />
          <Route path="/user/notifications" element={<UserDashboard activeDefaultTab="notifications" />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/payment/:bookingId" element={<PaymentCheckoutPage />} />
          <Route path="/parking/:id" element={<ParkingDetails />} />
          <Route path="/parking/slots" element={<SlotSelectionPage />} />
          <Route path="/user/select-slot" element={<SlotSelectionPage />} />
          <Route path="/user/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/parking/booking-confirmation" element={<BookingConfirmationPage />} />
        </Route>

        {/* Staff Gate Operator Protected Routes (Users cannot access) */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/check-in" element={<StaffCheckIn />} />
          <Route path="/staff/slots" element={<StaffSlotOverview />} />
        </Route>

        {/* Administrator Protected Routes (Users and Staff cannot access) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/slots" element={<AdminSlotManagement />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
