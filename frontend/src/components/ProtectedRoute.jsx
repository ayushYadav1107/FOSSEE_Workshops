import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, requireInstructor = false }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.profile?.is_email_verified) return <Navigate to="/activate" replace />;
  if (requireInstructor && !user.is_instructor) return <Navigate to="/status" replace />;

  return children;
}
