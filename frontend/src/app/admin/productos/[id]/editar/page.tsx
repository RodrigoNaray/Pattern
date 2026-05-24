import type { Metadata } from 'next';
import EditarProductoClient from './EditarProductoClient';

export const metadata: Metadata = {
  title: 'Editar Producto | Tienda de Ropa',
  description: 'Modifica los datos de un producto existente.',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  return <EditarProductoClient productoId={id} />;
}
