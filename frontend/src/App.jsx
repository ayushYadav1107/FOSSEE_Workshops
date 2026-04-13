import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import ActivationPage       from './pages/ActivationPage';
import HomePage             from './pages/HomePage';
import DashboardPage        from './pages/DashboardPage';
import StatusPage           from './pages/StatusPage';
import ProposePage          from './pages/ProposePage';
import WorkshopTypesPage    from './pages/WorkshopTypesPage';
import WorkshopDetailPage   from './pages/WorkshopDetailPage';
import StatisticsPage       from './pages/StatisticsPage';
import ProfilePage          from './pages/ProfilePage';
import CoordinatorProfilePage from './pages/CoordinatorProfilePage';
import WorkshopTypeDetailPage from './pages/WorkshopTypeDetailPage';

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />
          <Route path="/activate"   element={<ActivationPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/types"      element={<WorkshopTypesPage />} />
          <Route path="/types/:id"  element={<WorkshopTypeDetailPage />} />

          <Route path="/" element={
            user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
          } />

          <Route path="/home" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
          } />
          <Route path="/status" element={
            <ProtectedRoute><StatusPage /></ProtectedRoute>
          } />
          <Route path="/propose" element={
            <ProtectedRoute><ProposePage /></ProtectedRoute>
          } />
          <Route path="/workshops/:id" element={
            <ProtectedRoute><WorkshopDetailPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute requireInstructor><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/profile/:id" element={
            <ProtectedRoute requireInstructor><CoordinatorProfilePage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
