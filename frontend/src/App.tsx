import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared/Toast';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Itinerary from './pages/Itinerary';
import ItineraryDetail from './pages/ItineraryDetail';
import PlanTrip from './pages/PlanTrip';
import Bookings from './pages/Bookings';
import AmalfiBookings from './pages/AmalfiBookings';
import Expenses from './pages/Expenses';
import Collaboration from './pages/Collaboration';
import Vault from './pages/Vault';
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { SearchProvider } from './context/SearchContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Routes>
                {/* Public routes - redirect to dashboard if already authenticated */}
                <Route path="/login" element={
                  <ProtectedRoute requireAuth={false}>
                    <Login initialMode="login" />
                  </ProtectedRoute>
                } />
                <Route path="/register" element={
                  <ProtectedRoute requireAuth={false}>
                    <Login initialMode="signup" />
                  </ProtectedRoute>
                } />
                <Route path="/forgot-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPassword />
                  </ProtectedRoute>
                } />
                <Route path="/reset-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ResetPassword />
                  </ProtectedRoute>
                } />

                {/* Protected routes - require authentication */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/itinerary" element={
                  <ProtectedRoute>
                    <Itinerary />
                  </ProtectedRoute>
                } />
                <Route path="/itinerary/:id" element={
                  <ProtectedRoute>
                    <ItineraryDetail />
                  </ProtectedRoute>
                } />
                <Route path="/plan-trip" element={
                  <ProtectedRoute>
                    <PlanTrip />
                  </ProtectedRoute>
                } />
                <Route path="/bookings" element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                } />
                <Route path="/bookings/amalfi/:id" element={
                  <ProtectedRoute>
                    <AmalfiBookings />
                  </ProtectedRoute>
                } />
                <Route path="/expenses" element={
                  <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                } />
                <Route path="/collaboration" element={
                  <ProtectedRoute>
                    <Collaboration />
                  </ProtectedRoute>
                } />
                <Route path="/vault" element={
                  <ProtectedRoute>
                    <Vault />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                {/* Default route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 route */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
                      <p className="text-muted-foreground mb-6">Page not found</p>
                      <a href="/" className="text-primary hover:text-primary/80 font-medium">
                        Go back home
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;
