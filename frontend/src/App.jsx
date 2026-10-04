import React from 'react';
// HashRouter is required for GitHub Pages: it stores the route in the URL hash (#)
// so the browser never requests a deep-link path from the static server.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SupportPage from './pages/SupportPage';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Dedicated Layout component encapsulates Navbar, <Outlet />, and Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route path="/support" element={<SupportPage />} />

              {/* Role Protected Routes */}
              <Route
                path="/create-listing"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <CreateListingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
