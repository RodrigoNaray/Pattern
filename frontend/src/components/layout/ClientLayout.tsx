'use client';

import { usePathname } from 'next/navigation';
import { CarritoProvider } from '@/components/carrito/carrito-context';
import { Header } from './Header';
import { AdminHeader } from './AdminHeader';
import { Footer } from './Footer';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <CarritoProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {isAdmin ? <AdminHeader /> : <Header />}
        <main style={{ flex: '1' }}>{children}</main>
        <Footer />
      </div>
    </CarritoProvider>
  );
}
