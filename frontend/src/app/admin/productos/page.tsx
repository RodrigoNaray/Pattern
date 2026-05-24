import type { Metadata } from 'next';
import AdminProductosClient from './AdminProductosClient';

export const metadata: Metadata = {
  title: 'Gestión de Productos | Tienda de Ropa',
  description: 'Publica y administra los productos de la tienda.',
};

export default function AdminProductosPage() {
  return <AdminProductosClient />;
}
