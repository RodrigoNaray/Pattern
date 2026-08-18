import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { AdminHeader } from './AdminHeader';
import { Footer } from './Footer';

export function ClientLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isAdmin ? <AdminHeader /> : <Header />}
      <main style={{ flex: '1' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
