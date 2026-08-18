import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { estaAutenticado } from '@/services/auth.service';

export default function RequireAuth() {
  const location = useLocation();
  const autenticado = estaAutenticado();

  if (!autenticado) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
