import AdminProductosClient from './AdminProductosClient';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AdminProductos() {
  usePageTitle('Gestion de Productos | Tienda de Ropa');
  return <AdminProductosClient />;
}
