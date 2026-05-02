import './App.scss';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/dashboard';
import ErrorPage from './components/common/error-page';
import ProtectedRoute from './components/common/protected-route';
import RoleRoute from './components/common/role-route';
import Contact from './components/contact';
import About from './components/about';
import LandingPage from './components/landing-page';
import Login from './components/auth/login';
import Signup from './components/auth/signup';
import OAuthCallback from './components/auth/oauth-callback';
import Profile from './components/profile';
import AdminUsers from './components/admin/users';
import Scholarships from './components/scholarships';
import ScholarshipDetail from './components/scholarships/detail';
import Sponsorships from './components/sponsorships';
import SponsorshipDetail from './components/sponsorships/detail';
import NewSponsorship from './components/sponsorships/new';
import MyActivity from './components/sponsorships/mine';
import AdminSponsorshipReview from './components/sponsorships/admin-review';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161c22',
                color: '#e8ecef',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.9rem',
              },
              success: { iconTheme: { primary: '#01bf71', secondary: '#0a0d10' } },
              error:   { iconTheme: { primary: '#ff4d6d', secondary: '#0a0d10' } },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminUsers />
                </RoleRoute>
              }
            />

            {/* Scholarships (public read-only) */}
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/scholarships/:id" element={<ScholarshipDetail />} />

            {/* Sponsor a student */}
            <Route path="/sponsor" element={<Sponsorships />} />
            <Route path="/sponsor/:id" element={<SponsorshipDetail />} />
            <Route
              path="/sponsor/new"
              element={
                <ProtectedRoute>
                  <NewSponsorship />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sponsor/mine"
              element={
                <ProtectedRoute>
                  <MyActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sponsorships"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminSponsorshipReview />
                </RoleRoute>
              }
            />

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
