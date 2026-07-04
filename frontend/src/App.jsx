import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Public
import HomePage from './pages/home/HomePage';
import AboutPage from './pages/home/AboutPage';
import ContactPage from './pages/home/ContactPage';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Pages - Hotel
import HotelListPage from './pages/hotel/HotelListPage';
import HotelDetailPage from './pages/hotel/HotelDetailPage';

// Pages - Booking
import BookingPage from "./pages/booking/BookingPage";
import PaymentPage from "./pages/booking/PaymentPage";
import MyBookingsPage from "./pages/booking/MyBookingsPage";
import BookingConfirmationPage from "./pages/booking/BookingConfirmationPage";

// Pages - Dashboard
import DashboardHome from './pages/dashboard/DashboardHome';
import ManageHotels from './pages/dashboard/ManageHotels';
import ManageRooms from './pages/dashboard/ManageRooms';
import ManageBookings from './pages/dashboard/ManageBookings';
import ManageUsers from './pages/dashboard/ManageUsers';
import ManagePayments from './pages/dashboard/ManagePayments';
import OwnerEarnings from './pages/dashboard/OwnerEarnings';

// Pages - User
import ProfilePage from './pages/user/ProfilePage';
import WishlistPage from './pages/user/WishlistPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, token]);

  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="hotels" element={<HotelListPage />} />
        <Route path="hotels/:id" element={<HotelDetailPage />} />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected User Routes */}
        {/* Protected User Routes */}
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="book/:hotelId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:bookingId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="booking-confirmation/:id"
          element={
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "owner"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="hotels" element={<ManageHotels />} />
        <Route path="hotels/:hotelId/rooms" element={<ManageRooms />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="payments" element={<ManagePayments />} />
        <Route path="earnings" element={<OwnerEarnings />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Page not found</p>
            <a href="/" className="btn-primary">
              Go Home
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;