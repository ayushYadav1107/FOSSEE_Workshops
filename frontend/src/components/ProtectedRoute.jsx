import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, requireInstructor = false }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  // Email verification removed — all authenticated users are allowed.
  if (requireInstructor && !user.is_instructor) return <Navigate to="/status" replace />;

  return children;
}
