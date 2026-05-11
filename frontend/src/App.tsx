import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared/Toast';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { SearchProvider } from './context/SearchContext';
import './App.css';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Itinerary = lazy(() => import('./pages/Itinerary'));
const ItineraryDetail = lazy(() => import('./pages/ItineraryDetail'));
const PlanTrip = lazy(() => import('./pages/PlanTrip'));
const Bookings = lazy(() => import('./pages/Bookings'));
const AmalfiBookings = lazy(() => import('./pages/AmalfiBookings'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Collaboration = lazy(() => import('./pages/Collaboration'));
const Vault = lazy(() => import('./pages/Vault'));
const Settings = lazy(() => import('./pages/Settings'));
const PublicItinerary = lazy(() => import('./pages/PublicItinerary'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Initializing Voyager...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Suspense fallback={<LoadingFallback />}>
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
                  <Route path="/public/itinerary/:token" element={<PublicItinerary />} />

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
              </Suspense>
            </div>
          </Router>
        </ToastProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;
